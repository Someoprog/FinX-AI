"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, TrendingDown, TrendingUp, CreditCard, Home, Briefcase,
  AlertTriangle, CheckCircle, ArrowRight, RotateCcw, PiggyBank
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useFinance, formatTenge, type FinancialData } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

interface Scenario {
  id: string
  name: string
  icon: typeof TrendingUp
  description: string
  color: string
}

const scenarios: Scenario[] = [
  {
    id: "adjust-expenses",
    name: "Adjust Living Expenses",
    icon: TrendingDown,
    description: "Modify individual expense categories",
    color: "text-teal-500",
  },
  {
    id: "reallocate-cash",
    name: "Reallocate Extra Cash",
    icon: PiggyBank,
    description: "Distribute freed-up money",
    color: "text-blue-500",
  },
  {
    id: "new-loan",
    name: "Take New Loan",
    icon: CreditCard,
    description: "See impact of a new loan",
    color: "text-amber-500",
  },
  {
    id: "housing-change",
    name: "Housing Change",
    icon: Home,
    description: "Change your housing cost",
    color: "text-cyan-500",
  },
  {
    id: "job-change",
    name: "Job Change",
    icon: Briefcase,
    description: "Simulate a salary change",
    color: "text-emerald-500",
  },
]

export function WhatIfSimulator() {
  const { data, calculateRiskScoreFromData } = useFinance()
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  
  // Base financial data (read-only copy)
  const baseData = data
  
  // Scenario adjustments - these modify a SIMULATED copy, not real data
  const [expenseAdjustments, setExpenseAdjustments] = useState({
    subscriptions: 0, // percentage reduction
    utilities: 0,
    entertainment: 0,
    groceries: 0,
  })
  
  const [reallocationAdjustments, setReallocationAdjustments] = useState({
    addToDeposit: 0,
    addToCashSavings: 0,
    extraLoanPayment: 0,
  })
  
  const [newLoanParams, setNewLoanParams] = useState({
    amount: 500000,
    interestRate: 22,
    duration: 24,
  })
  
  const [housingAdjustment, setHousingAdjustment] = useState(baseData.rent)
  const [salaryAdjustment, setSalaryAdjustment] = useState(baseData.monthlyIncome)
  
  // Reset adjustments when scenario changes
  const handleScenarioChange = (scenarioId: string | null) => {
    setActiveScenario(scenarioId)
    // Reset all adjustments
    setExpenseAdjustments({ subscriptions: 0, utilities: 0, entertainment: 0, groceries: 0 })
    setReallocationAdjustments({ addToDeposit: 0, addToCashSavings: 0, extraLoanPayment: 0 })
    setNewLoanParams({ amount: 500000, interestRate: 22, duration: 24 })
    setHousingAdjustment(baseData.rent)
    setSalaryAdjustment(baseData.monthlyIncome)
  }

  // Calculate simulated financial data based on active scenario
  const simulatedData = useMemo((): FinancialData => {
    const simulated = { ...baseData }
    
    if (activeScenario === "adjust-expenses") {
      // Apply percentage reductions to expense categories
      simulated.subscriptions = baseData.subscriptions * (1 - expenseAdjustments.subscriptions / 100)
      simulated.utilities = baseData.utilities * (1 - expenseAdjustments.utilities / 100)
      simulated.entertainment = (baseData.entertainment || 0) * (1 - expenseAdjustments.entertainment / 100)
      simulated.groceries = (baseData.groceries || 0) * (1 - expenseAdjustments.groceries / 100)
      
      // Recalculate total expenses
      simulated.totalExpenses = simulated.rent + simulated.utilities + simulated.subscriptions + 
                               simulated.entertainment + simulated.groceries + simulated.mortgage
    }
    
    if (activeScenario === "reallocate-cash") {
      // Apply extra allocations (this uses freed-up cash)
      simulated.monthlyDepositContribution = baseData.monthlyDepositContribution + reallocationAdjustments.addToDeposit
      simulated.cashSavings = baseData.cashSavings + reallocationAdjustments.addToCashSavings
      
      // Extra loan payment reduces debt faster (simplified - reduces total debt)
      if (reallocationAdjustments.extraLoanPayment > 0 && baseData.totalDebt > 0) {
        simulated.totalDebt = Math.max(0, baseData.totalDebt - reallocationAdjustments.extraLoanPayment * 12)
      }
    }
    
    if (activeScenario === "new-loan") {
      // Calculate new loan monthly payment
      const monthlyRate = newLoanParams.interestRate / 100 / 12
      let newMonthlyPayment: number
      if (monthlyRate === 0) {
        newMonthlyPayment = newLoanParams.amount / newLoanParams.duration
      } else {
        newMonthlyPayment = (newLoanParams.amount * monthlyRate * Math.pow(1 + monthlyRate, newLoanParams.duration)) / 
                          (Math.pow(1 + monthlyRate, newLoanParams.duration) - 1)
      }
      
      simulated.totalDebt = baseData.totalDebt + newLoanParams.amount
      simulated.totalMonthlyDebtPayment = baseData.totalMonthlyDebtPayment + Math.round(newMonthlyPayment)
    }
    
    if (activeScenario === "housing-change") {
      simulated.rent = housingAdjustment
      simulated.totalExpenses = simulated.rent + simulated.utilities + simulated.subscriptions + 
                               (simulated.entertainment || 0) + (simulated.groceries || 0) + simulated.mortgage
    }
    
    if (activeScenario === "job-change") {
      simulated.monthlyIncome = salaryAdjustment
    }
    
    // Recalculate derived values
    simulated.freeCashFlow = simulated.monthlyIncome - simulated.totalExpenses - 
                            simulated.totalMonthlyDebtPayment - simulated.monthlyDepositContribution
    
    simulated.debtToIncomeRatio = simulated.monthlyIncome > 0 
      ? simulated.totalMonthlyDebtPayment / simulated.monthlyIncome 
      : 0
    
    // Calculate new risk score using the SAME algorithm
    simulated.riskScore = calculateRiskScoreFromData(simulated)
    
    return simulated
  }, [baseData, activeScenario, expenseAdjustments, reallocationAdjustments, newLoanParams, housingAdjustment, salaryAdjustment, calculateRiskScoreFromData])

  // Calculate changes
  const riskScoreChange = simulatedData.riskScore - baseData.riskScore
  const freeCashFlowChange = simulatedData.freeCashFlow - baseData.freeCashFlow
  const debtChange = simulatedData.totalDebt - baseData.totalDebt
  
  // Calculate freed up cash from expense reductions
  const freedUpCash = useMemo(() => {
    if (activeScenario !== "adjust-expenses") return 0
    const originalExpenses = baseData.subscriptions + baseData.utilities + 
                            (baseData.entertainment || 0) + (baseData.groceries || 0)
    const newExpenses = simulatedData.subscriptions + simulatedData.utilities + 
                       (simulatedData.entertainment || 0) + (simulatedData.groceries || 0)
    return originalExpenses - newExpenses
  }, [activeScenario, baseData, simulatedData])

  // Loan payment schedule for graph
  const loanPaymentSchedule = useMemo(() => {
    if (activeScenario !== "new-loan") return []
    
    const monthlyRate = newLoanParams.interestRate / 100 / 12
    let monthlyPayment: number
    if (monthlyRate === 0) {
      monthlyPayment = newLoanParams.amount / newLoanParams.duration
    } else {
      monthlyPayment = (newLoanParams.amount * monthlyRate * Math.pow(1 + monthlyRate, newLoanParams.duration)) / 
                      (Math.pow(1 + monthlyRate, newLoanParams.duration) - 1)
    }
    
    return Array.from({ length: Math.min(newLoanParams.duration, 48) }, (_, i) => ({
      month: i + 1,
      payment: Math.round(monthlyPayment),
    }))
  }, [activeScenario, newLoanParams])

  // Total interest for new loan
  const totalInterest = useMemo(() => {
    if (activeScenario !== "new-loan") return 0
    const monthlyRate = newLoanParams.interestRate / 100 / 12
    let monthlyPayment: number
    if (monthlyRate === 0) {
      monthlyPayment = newLoanParams.amount / newLoanParams.duration
    } else {
      monthlyPayment = (newLoanParams.amount * monthlyRate * Math.pow(1 + monthlyRate, newLoanParams.duration)) / 
                      (Math.pow(1 + monthlyRate, newLoanParams.duration) - 1)
    }
    return Math.round(monthlyPayment * newLoanParams.duration - newLoanParams.amount)
  }, [activeScenario, newLoanParams])

  const getRiskLevelColor = (score: number) => {
    if (score >= 70) return "text-emerald-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const getChangeColor = (change: number, isPositive: boolean = true) => {
    if (change === 0) return "text-muted-foreground"
    return (isPositive ? change > 0 : change < 0) ? "text-emerald-500" : "text-red-500"
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">What-If Simulator</h1>
          <p className="text-muted-foreground">Explore how different decisions would affect your finances</p>
        </div>
      </motion.div>

      {/* Current Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Financial Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className={cn("text-2xl font-bold", getRiskLevelColor(baseData.riskScore))}>
                  {baseData.riskScore}
                </p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Free Cash Flow</p>
                <p className={cn(
                  "text-2xl font-bold",
                  baseData.freeCashFlow >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {formatTenge(baseData.freeCashFlow)}
                </p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold">{formatTenge(baseData.totalDebt)}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold">
                  {baseData.monthlyIncome > 0 ? Math.round((baseData.monthlyDepositContribution / baseData.monthlyIncome) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scenario Selection */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3">Choose a Scenario</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {scenarios.map((scenario) => (
            <Card 
              key={scenario.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                activeScenario === scenario.id && "ring-2 ring-primary border-primary"
              )}
              onClick={() => handleScenarioChange(activeScenario === scenario.id ? null : scenario.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={cn("p-2 rounded-lg bg-secondary", scenario.color)}>
                    <scenario.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-sm">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Scenario Configuration & Results */}
      {activeScenario && (
        <motion.div 
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Adjust Parameters</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleScenarioChange(activeScenario)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
              <CardDescription>Fine-tune the scenario to see different outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scenario 1: Adjust Living Expenses */}
              {activeScenario === "adjust-expenses" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Subscriptions Reduction</Label>
                      <span className="text-sm font-medium">{expenseAdjustments.subscriptions}%</span>
                    </div>
                    <Slider
                      value={[expenseAdjustments.subscriptions]}
                      onValueChange={([value]) => setExpenseAdjustments(prev => ({ ...prev, subscriptions: value }))}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {formatTenge(baseData.subscriptions)} → New: {formatTenge(simulatedData.subscriptions)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Utilities Reduction</Label>
                      <span className="text-sm font-medium">{expenseAdjustments.utilities}%</span>
                    </div>
                    <Slider
                      value={[expenseAdjustments.utilities]}
                      onValueChange={([value]) => setExpenseAdjustments(prev => ({ ...prev, utilities: value }))}
                      min={0}
                      max={50}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {formatTenge(baseData.utilities)} → New: {formatTenge(simulatedData.utilities)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Entertainment Reduction</Label>
                      <span className="text-sm font-medium">{expenseAdjustments.entertainment}%</span>
                    </div>
                    <Slider
                      value={[expenseAdjustments.entertainment]}
                      onValueChange={([value]) => setExpenseAdjustments(prev => ({ ...prev, entertainment: value }))}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {formatTenge(baseData.entertainment || 0)} → New: {formatTenge(simulatedData.entertainment || 0)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Groceries Reduction</Label>
                      <span className="text-sm font-medium">{expenseAdjustments.groceries}%</span>
                    </div>
                    <Slider
                      value={[expenseAdjustments.groceries]}
                      onValueChange={([value]) => setExpenseAdjustments(prev => ({ ...prev, groceries: value }))}
                      min={0}
                      max={30}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {formatTenge(baseData.groceries || 0)} → New: {formatTenge(simulatedData.groceries || 0)}
                    </p>
                  </div>

                  {freedUpCash > 0 && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm text-emerald-500 font-medium">
                        Extra cash available: {formatTenge(Math.round(freedUpCash))}/month
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 2: Reallocate Extra Cash */}
              {activeScenario === "reallocate-cash" && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Available free cash: <span className="font-medium text-foreground">{formatTenge(Math.max(0, baseData.freeCashFlow))}</span>/month
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Add to Deposit</Label>
                      <span className="text-sm font-medium">{formatTenge(reallocationAdjustments.addToDeposit)}</span>
                    </div>
                    <Slider
                      value={[reallocationAdjustments.addToDeposit]}
                      onValueChange={([value]) => setReallocationAdjustments(prev => ({ ...prev, addToDeposit: value }))}
                      min={0}
                      max={Math.max(baseData.freeCashFlow, 100000)}
                      step={5000}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Add to Cash Savings</Label>
                      <span className="text-sm font-medium">{formatTenge(reallocationAdjustments.addToCashSavings)}</span>
                    </div>
                    <Slider
                      value={[reallocationAdjustments.addToCashSavings]}
                      onValueChange={([value]) => setReallocationAdjustments(prev => ({ ...prev, addToCashSavings: value }))}
                      min={0}
                      max={Math.max(baseData.freeCashFlow, 100000)}
                      step={5000}
                    />
                  </div>

                  {baseData.totalDebt > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Extra Loan Payment</Label>
                        <span className="text-sm font-medium">{formatTenge(reallocationAdjustments.extraLoanPayment)}/month</span>
                      </div>
                      <Slider
                        value={[reallocationAdjustments.extraLoanPayment]}
                        onValueChange={([value]) => setReallocationAdjustments(prev => ({ ...prev, extraLoanPayment: value }))}
                        min={0}
                        max={Math.max(baseData.freeCashFlow, 100000)}
                        step={5000}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 3: New Loan */}
              {activeScenario === "new-loan" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Loan Amount</Label>
                      <span className="text-sm font-medium">{formatTenge(newLoanParams.amount)}</span>
                    </div>
                    <Slider
                      value={[newLoanParams.amount]}
                      onValueChange={([value]) => setNewLoanParams(prev => ({ ...prev, amount: value }))}
                      min={100000}
                      max={10000000}
                      step={100000}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Interest Rate</Label>
                      <span className="text-sm font-medium">{newLoanParams.interestRate}%</span>
                    </div>
                    <Slider
                      value={[newLoanParams.interestRate]}
                      onValueChange={([value]) => setNewLoanParams(prev => ({ ...prev, interestRate: value }))}
                      min={10}
                      max={50}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Duration</Label>
                      <span className="text-sm font-medium">{newLoanParams.duration} months</span>
                    </div>
                    <Slider
                      value={[newLoanParams.duration]}
                      onValueChange={([value]) => setNewLoanParams(prev => ({ ...prev, duration: value }))}
                      min={6}
                      max={60}
                      step={6}
                    />
                  </div>

                  <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                    <p className="text-sm">Monthly Payment: <span className="font-semibold text-primary">{formatTenge(simulatedData.totalMonthlyDebtPayment - baseData.totalMonthlyDebtPayment)}</span></p>
                    <p className="text-sm">Total Interest: <span className="font-semibold text-amber-500">{formatTenge(totalInterest)}</span></p>
                  </div>

                  {/* Loan Payment Graph */}
                  {loanPaymentSchedule.length > 0 && (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={loanPaymentSchedule}>
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => value % 6 === 0 ? `${value}m` : ''}
                          />
                          <YAxis 
                            tick={{ fontSize: 10 }}
                            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => formatTenge(value)}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="payment" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Scenario 4: Housing Change */}
              {activeScenario === "housing-change" && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Current housing cost: <span className="font-medium text-foreground">{formatTenge(baseData.rent)}</span>/month
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>New Housing Cost</Label>
                      <span className="text-sm font-medium">{formatTenge(housingAdjustment)}</span>
                    </div>
                    <Slider
                      value={[housingAdjustment]}
                      onValueChange={([value]) => setHousingAdjustment(value)}
                      min={0}
                      max={baseData.rent * 3}
                      step={10000}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={housingAdjustment}
                      onChange={(e) => setHousingAdjustment(Number(e.target.value))}
                      className="h-10"
                    />
                    <span className="text-muted-foreground">₸</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setHousingAdjustment(0)}
                    >
                      Free housing
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setHousingAdjustment(Math.round(baseData.rent * 0.7))}
                    >
                      30% cheaper
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setHousingAdjustment(Math.round(baseData.rent * 1.5))}
                    >
                      50% more
                    </Button>
                  </div>
                </div>
              )}

              {/* Scenario 5: Job Change */}
              {activeScenario === "job-change" && (
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Current salary: <span className="font-medium text-foreground">{formatTenge(baseData.monthlyIncome)}</span>/month
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>New Salary</Label>
                      <span className="text-sm font-medium">{formatTenge(salaryAdjustment)}</span>
                    </div>
                    <Slider
                      value={[salaryAdjustment]}
                      onValueChange={([value]) => setSalaryAdjustment(value)}
                      min={50000}
                      max={baseData.monthlyIncome * 3}
                      step={10000}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={salaryAdjustment}
                      onChange={(e) => setSalaryAdjustment(Number(e.target.value))}
                      className="h-10"
                    />
                    <span className="text-muted-foreground">₸</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSalaryAdjustment(Math.round(baseData.monthlyIncome * 0.8))}
                    >
                      -20%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSalaryAdjustment(Math.round(baseData.monthlyIncome * 1.2))}
                    >
                      +20%
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSalaryAdjustment(Math.round(baseData.monthlyIncome * 1.5))}
                    >
                      +50%
                    </Button>
                  </div>

                  {salaryAdjustment !== baseData.monthlyIncome && (
                    <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                      <p className="text-sm">New Savings Rate: <span className="font-semibold">
                        {salaryAdjustment > 0 ? Math.round((baseData.monthlyDepositContribution / salaryAdjustment) * 100) : 0}%
                      </span></p>
                      <p className="text-sm">New DTI Ratio: <span className="font-semibold">
                        {salaryAdjustment > 0 ? Math.round((baseData.totalMonthlyDebtPayment / salaryAdjustment) * 100) : 0}%
                      </span></p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className={cn(
            "border-2",
            riskScoreChange > 0 ? "border-emerald-500/30" : 
            riskScoreChange < 0 ? "border-red-500/30" : "border-border"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Projected Outcome</span>
                <Badge className={cn(
                  riskScoreChange > 0 ? "bg-emerald-500 text-white" : 
                  riskScoreChange < 0 ? "bg-red-500 text-white" : 
                  "bg-secondary text-foreground"
                )}>
                  {riskScoreChange > 0 ? "Positive Impact" : 
                   riskScoreChange < 0 ? "Negative Impact" : "Neutral"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Score Change */}
              <div className="p-4 rounded-lg border bg-secondary/30">
                <p className="text-sm text-muted-foreground mb-2">Risk Score Change</p>
                <div className="flex items-center gap-3">
                  <span className={cn("text-2xl font-bold", getRiskLevelColor(baseData.riskScore))}>
                    {baseData.riskScore}
                  </span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <span className={cn("text-2xl font-bold", getRiskLevelColor(simulatedData.riskScore))}>
                    {simulatedData.riskScore}
                  </span>
                  <Badge className={cn(
                    "ml-auto",
                    getChangeColor(riskScoreChange)
                  )}>
                    {riskScoreChange > 0 ? "+" : ""}{riskScoreChange} pts
                  </Badge>
                </div>
              </div>

              {/* Metrics Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Free Cash Flow</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatTenge(baseData.freeCashFlow)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className={cn("font-medium", getChangeColor(freeCashFlowChange))}>
                        {formatTenge(simulatedData.freeCashFlow)}
                      </span>
                    </div>
                  </div>
                  <Badge className={getChangeColor(freeCashFlowChange)}>
                    {freeCashFlowChange >= 0 ? "+" : ""}{formatTenge(freeCashFlowChange)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Debt</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatTenge(baseData.totalDebt)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className={cn("font-medium", getChangeColor(-debtChange))}>
                        {formatTenge(simulatedData.totalDebt)}
                      </span>
                    </div>
                  </div>
                  <Badge className={getChangeColor(-debtChange)}>
                    {debtChange >= 0 ? "+" : ""}{formatTenge(debtChange)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">DTI Ratio</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Math.round(baseData.debtToIncomeRatio * 100)}%</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {Math.round(simulatedData.debtToIncomeRatio * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Message */}
              <div className={cn(
                "p-4 rounded-lg border",
                riskScoreChange > 0 ? "bg-emerald-500/10 border-emerald-500/20" : 
                riskScoreChange < 0 ? "bg-red-500/10 border-red-500/20" : 
                "bg-secondary/50 border-border"
              )}>
                <div className="flex items-start gap-2">
                  {riskScoreChange > 0 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : riskScoreChange < 0 ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">
                    {riskScoreChange > 0 
                      ? `This change would improve your financial health score by ${riskScoreChange} points.`
                      : riskScoreChange < 0
                      ? `This change would decrease your financial health score by ${Math.abs(riskScoreChange)} points. Consider the trade-offs carefully.`
                      : "This change would have minimal impact on your overall financial health score."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
