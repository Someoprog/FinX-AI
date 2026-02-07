"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface ExpenseCategory {
  id: string
  name: string
  amount: number
  icon: string
}

export interface Loan {
  id: string
  name: string
  amount: number
  interestRate: number
  duration: number // months
  monthlyPayment: number
}

export interface FinancialData {
  // Income
  monthlyIncome: number
  
  // Fixed Expenses (split into categories for simulator)
  rent: number
  utilities: number
  subscriptions: number
  entertainment: number
  groceries: number
  mortgage: number
  otherExpenses: ExpenseCategory[]
  
  // Debts
  loans: Loan[]
  
  // Savings - Split into two types
  cashSavings: number         // Cash/card balance - doesn't grow
  depositSavings: number      // Money on deposit - grows with interest
  depositInterestRate: number // Annual interest rate %
  monthlyDepositContribution: number // Monthly contribution to deposit
  
  // Legacy field for backwards compatibility
  currentSavings: number      // Total of cash + deposit
  plannedMonthlySavings: number // Legacy - now use monthlyDepositContribution
  
  // Calculated fields
  totalExpenses: number
  totalDebt: number
  totalMonthlyDebtPayment: number
  freeCashFlow: number
  debtToIncomeRatio: number
  riskScore: number
  
  // Onboarding
  onboardingCompleted: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

interface FinanceContextType {
  data: FinancialData
  updateData: (newData: Partial<FinancialData>) => void
  resetData: () => void
  calculateRiskScore: () => number
  calculateRiskScoreFromData: (financialData: FinancialData) => number
  getAvailableMoney: () => number
  achievements: Achievement[]
  unlockAchievement: (id: string) => void
}

const defaultData: FinancialData = {
  monthlyIncome: 0,
  rent: 0,
  utilities: 0,
  subscriptions: 0,
  entertainment: 0,
  groceries: 0,
  mortgage: 0,
  otherExpenses: [],
  loans: [],
  cashSavings: 0,
  depositSavings: 0,
  depositInterestRate: 14,
  monthlyDepositContribution: 0,
  currentSavings: 0,
  plannedMonthlySavings: 0,
  totalExpenses: 0,
  totalDebt: 0,
  totalMonthlyDebtPayment: 0,
  freeCashFlow: 0,
  debtToIncomeRatio: 0,
  riskScore: 0,
  onboardingCompleted: false,
}

const defaultAchievements: Achievement[] = [
  { id: 'first-budget', name: 'First Budget Created', description: 'Complete your first financial profile', icon: '1', unlocked: false },
  { id: 'savings-started', name: 'Savings Plan Started', description: 'Set up a monthly savings goal', icon: '2', unlocked: false },
  { id: 'three-month-streak', name: '3-Month Saving Streak', description: 'Save consistently for 3 months', icon: '3', unlocked: false },
  { id: 'debt-improved', name: 'Debt Ratio Improved', description: 'Lower your debt-to-income ratio', icon: '4', unlocked: false },
  { id: 'expense-optimized', name: 'Expense Optimization Applied', description: 'Apply an expense reduction recommendation', icon: '5', unlocked: false },
  { id: 'emergency-fund', name: 'Emergency Fund Started', description: 'Build savings equal to 1 month expenses', icon: '6', unlocked: false },
  { id: 'smart-credit', name: 'Smart Credit Avoided', description: 'Avoid taking a risky loan', icon: '7', unlocked: false },
  { id: 'risk-improved', name: 'Risk Score Improved by 20+', description: 'Improve your financial health score significantly', icon: '8', unlocked: false },
  { id: 'savings-goal', name: 'Savings Goal Reached', description: 'Reach your target savings amount', icon: '9', unlocked: false },
]

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinancialData>(defaultData)
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('finx-data')
    const storedAchievements = localStorage.getItem('finx-achievements')
    if (stored) {
      try {
        const parsedData = JSON.parse(stored)
        // Migrate old data structure if needed
        if (parsedData.currentSavings !== undefined && parsedData.cashSavings === undefined) {
          parsedData.cashSavings = parsedData.currentSavings
          parsedData.depositSavings = 0
          parsedData.depositInterestRate = 14
          parsedData.monthlyDepositContribution = parsedData.plannedMonthlySavings || 0
        }
        if (parsedData.entertainment === undefined) parsedData.entertainment = 0
        if (parsedData.groceries === undefined) parsedData.groceries = 0
        setData({ ...defaultData, ...parsedData })
      } catch (e) {
        console.error('Failed to parse stored data:', e)
      }
    }
    if (storedAchievements) {
      try {
        setAchievements(JSON.parse(storedAchievements))
      } catch (e) {
        console.error('Failed to parse stored achievements:', e)
      }
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (data !== defaultData) {
      localStorage.setItem('finx-data', JSON.stringify(data))
    }
  }, [data])

  useEffect(() => {
    localStorage.setItem('finx-achievements', JSON.stringify(achievements))
  }, [achievements])

  // NEW RISK SCORE ALGORITHM
  // Total = 100 points
  // - Free Cash Flow Ratio: 0-30 points
  // - Debt-to-Income Ratio: 0-25 points
  // - Savings Rate: 0-20 points
  // - Emergency Cushion: 0-15 points
  // - Deposit Discipline: 0-10 points
  const calculateRiskScoreFromData = (financialData: FinancialData): number => {
    // If no income data, return 0
    if (financialData.monthlyIncome <= 0) {
      return 0
    }

    const income = financialData.monthlyIncome
    const totalExpenses = financialData.totalExpenses
    const monthlyDebtPayments = financialData.totalMonthlyDebtPayment
    const monthlyDepositContribution = financialData.monthlyDepositContribution
    const cashSavings = financialData.cashSavings
    const depositSavings = financialData.depositSavings
    const monthlyExpenses = totalExpenses + monthlyDebtPayments

    // 1. FREE CASH FLOW RATIO (0-30 points)
    // freeCashFlow = income - totalExpenses - monthlyDebtPayments
    const freeCashFlow = income - totalExpenses - monthlyDebtPayments
    const freeCashFlowRatio = freeCashFlow / income
    let cashFlowScore = 0
    if (freeCashFlowRatio >= 0.3) {
      cashFlowScore = 30
    } else if (freeCashFlowRatio >= 0.2) {
      cashFlowScore = 24
    } else if (freeCashFlowRatio >= 0.1) {
      cashFlowScore = 18
    } else if (freeCashFlowRatio > 0) {
      cashFlowScore = 10
    } else {
      cashFlowScore = 0
    }

    // 2. DEBT-TO-INCOME RATIO (0-25 points)
    // DTI = monthlyDebtPayments / income
    let debtScore = 0
    if (monthlyDebtPayments === 0) {
      debtScore = 25 // No debt = full points
    } else {
      const dti = monthlyDebtPayments / income
      if (dti < 0.15) {
        debtScore = 25
      } else if (dti < 0.25) {
        debtScore = 20
      } else if (dti < 0.35) {
        debtScore = 15
      } else if (dti < 0.45) {
        debtScore = 8
      } else {
        debtScore = 0
      }
    }

    // 3. SAVINGS RATE (0-20 points)
    // savingsRate = monthlyDepositContribution / income
    let savingsRateScore = 0
    if (income > 0) {
      const savingsRate = monthlyDepositContribution / income
      if (savingsRate >= 0.2) {
        savingsRateScore = 20
      } else if (savingsRate >= 0.15) {
        savingsRateScore = 16
      } else if (savingsRate >= 0.1) {
        savingsRateScore = 12
      } else if (savingsRate >= 0.05) {
        savingsRateScore = 8
      } else if (savingsRate > 0) {
        savingsRateScore = 4
      } else {
        savingsRateScore = 0
      }
    }

    // 4. EMERGENCY CUSHION (0-15 points)
    // cushion = cashSavings / monthlyExpenses (how many months of expenses covered)
    let emergencyCushionScore = 0
    if (monthlyExpenses > 0) {
      const cushionMonths = cashSavings / monthlyExpenses
      if (cushionMonths >= 6) {
        emergencyCushionScore = 15
      } else if (cushionMonths >= 3) {
        emergencyCushionScore = 12
      } else if (cushionMonths >= 1) {
        emergencyCushionScore = 8
      } else if (cushionMonths > 0) {
        emergencyCushionScore = 4
      } else {
        emergencyCushionScore = 0
      }
    }

    // 5. DEPOSIT DISCIPLINE (0-10 points)
    // Has deposit savings AND makes regular contributions
    let depositDisciplineScore = 0
    if (depositSavings > 0 && monthlyDepositContribution > 0) {
      depositDisciplineScore = 10
    } else if (depositSavings > 0 || monthlyDepositContribution > 0) {
      depositDisciplineScore = 5
    } else {
      depositDisciplineScore = 0
    }

    const totalScore = cashFlowScore + debtScore + savingsRateScore + emergencyCushionScore + depositDisciplineScore
    return Math.max(0, Math.min(100, Math.round(totalScore)))
  }

  // Wrapper that uses current data state
  const calculateRiskScore = (): number => {
    return calculateRiskScoreFromData(data)
  }
  
  // Helper to get available money for savings
  const getAvailableMoney = () => {
    return data.monthlyIncome - data.totalExpenses - data.totalMonthlyDebtPayment
  }

  const updateData = (newData: Partial<FinancialData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData }

      // Recalculate derived values
      const otherExpensesTotal = updated.otherExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      )
      updated.totalExpenses =
        updated.rent +
        updated.utilities +
        updated.subscriptions +
        updated.entertainment +
        updated.groceries +
        updated.mortgage +
        otherExpensesTotal

      updated.totalDebt = updated.loans.reduce(
        (sum, loan) => sum + loan.amount,
        0
      )
      updated.totalMonthlyDebtPayment = updated.loans.reduce(
        (sum, loan) => sum + loan.monthlyPayment,
        0
      )

      // Update legacy fields for backwards compatibility
      updated.currentSavings = updated.cashSavings + updated.depositSavings
      updated.plannedMonthlySavings = updated.monthlyDepositContribution

      updated.freeCashFlow =
        updated.monthlyIncome -
        updated.totalExpenses -
        updated.totalMonthlyDebtPayment -
        updated.monthlyDepositContribution

      updated.debtToIncomeRatio =
        updated.monthlyIncome > 0
          ? updated.totalMonthlyDebtPayment / updated.monthlyIncome
          : 0

      // Calculate risk score with the updated data
      updated.riskScore = calculateRiskScoreFromData(updated)

      return updated
    })
  }

  const resetData = () => {
    setData(defaultData)
    setAchievements(defaultAchievements)
    localStorage.removeItem('finx-data')
    localStorage.removeItem('finx-achievements')
  }

  const unlockAchievement = (id: string) => {
    setAchievements(prev => 
      prev.map(a => 
        a.id === id && !a.unlocked 
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      )
    )
  }

  return (
    <FinanceContext.Provider value={{ 
      data, 
      updateData, 
      resetData, 
      calculateRiskScore,
      calculateRiskScoreFromData,
      getAvailableMoney,
      achievements, 
      unlockAchievement 
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}

// Utility function to format Tenge
export function formatTenge(amount: number): string {
  return amount.toLocaleString('ru-KZ').replace(/,/g, ' ') + ' ₸'
}
