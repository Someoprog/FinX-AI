"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Wallet, Home, CreditCard, PiggyBank, Check, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useFinance, formatTenge, type Loan } from "@/lib/finance-context"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Income", icon: Wallet, description: "Enter your total monthly income" },
  { id: 2, title: "Expenses", icon: Home, description: "Add your monthly expenses" },
  { id: 3, title: "Loans", icon: CreditCard, description: "List any active loans" },
  { id: 4, title: "Savings", icon: PiggyBank, description: "Set your savings structure" },
]

const incomePresets = [150000, 250000, 400000, 600000, 800000, 1000000]
const expensePresets = {
  rent: [50000, 80000, 120000, 180000, 250000],
  utilities: [10000, 20000, 35000, 50000],
  subscriptions: [5000, 10000, 20000, 30000],
  entertainment: [10000, 20000, 40000, 60000],
  groceries: [30000, 50000, 80000, 100000],
}

export function OnboardingWizard() {
  const { data, updateData, unlockAchievement } = useFinance()
  const [currentStep, setCurrentStep] = useState(1)
  const [localData, setLocalData] = useState({
    monthlyIncome: data.monthlyIncome || 400000,
    rent: data.rent || 80000,
    utilities: data.utilities || 20000,
    subscriptions: data.subscriptions || 10000,
    entertainment: data.entertainment || 20000,
    groceries: data.groceries || 50000,
    mortgage: data.mortgage || 0,
    // Split savings
    cashSavings: data.cashSavings || 0,
    depositSavings: data.depositSavings || 0,
    depositInterestRate: data.depositInterestRate || 14,
    monthlyDepositContribution: data.monthlyDepositContribution || 40000,
    loans: data.loans || [] as Loan[],
  })

  const [newLoan, setNewLoan] = useState({
    name: "",
    amount: 500000,
    interestRate: 20,
    duration: 12,
  })

  const calculateMonthlyPayment = (amount: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12
    if (monthlyRate === 0) return amount / months
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const addLoan = () => {
    if (newLoan.name && newLoan.amount > 0) {
      const monthlyPayment = calculateMonthlyPayment(newLoan.amount, newLoan.interestRate, newLoan.duration)
      setLocalData(prev => ({
        ...prev,
        loans: [...prev.loans, {
          id: Date.now().toString(),
          ...newLoan,
          monthlyPayment: Math.round(monthlyPayment),
        }]
      }))
      setNewLoan({ name: "", amount: 500000, interestRate: 20, duration: 12 })
    }
  }

  const removeLoan = (id: string) => {
    setLocalData(prev => ({
      ...prev,
      loans: prev.loans.filter(l => l.id !== id)
    }))
  }

  const handleComplete = () => {
    updateData({
      ...localData,
      onboardingCompleted: true,
    })
    unlockAchievement('first-budget')
    if (localData.monthlyDepositContribution > 0) {
      unlockAchievement('savings-started')
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
    else handleComplete()
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const progress = (currentStep / 4) * 100

  // Calculate totals for preview
  const totalExpenses = localData.rent + localData.utilities + localData.subscriptions + 
                       localData.entertainment + localData.groceries + localData.mortgage
  const totalLoanPayments = localData.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
  const freeCashFlow = localData.monthlyIncome - totalExpenses - totalLoanPayments - localData.monthlyDepositContribution

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-border/50">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12">
              <Image 
                src="/logo.png" 
                alt="FinX Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl">FinX</CardTitle>
              <CardDescription>Let's set up your financial profile</CardDescription>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  currentStep >= step.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                )}>
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Income */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What is your monthly income?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your total monthly income after taxes
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={localData.monthlyIncome}
                        onChange={(e) => setLocalData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                        className="text-xl font-semibold h-14"
                      />
                      <span className="text-xl font-semibold text-muted-foreground">₸</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {incomePresets.map((amount) => (
                        <Button
                          key={amount}
                          variant={localData.monthlyIncome === amount ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLocalData(prev => ({ ...prev, monthlyIncome: amount }))}
                        >
                          {formatTenge(amount)}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Slider
                        value={[localData.monthlyIncome]}
                        onValueChange={([value]) => setLocalData(prev => ({ ...prev, monthlyIncome: value }))}
                        min={50000}
                        max={2000000}
                        step={10000}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>50 000 ₸</span>
                        <span>2 000 000 ₸</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Fixed Expenses */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Monthly Expenses</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your regular monthly expenses by category
                    </p>
                  </div>

                  <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
                    {/* Rent */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rent / Housing</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.rent}
                          onChange={(e) => setLocalData(prev => ({ ...prev, rent: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expensePresets.rent.map((amount) => (
                          <Button
                            key={amount}
                            variant={localData.rent === amount ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setLocalData(prev => ({ ...prev, rent: amount }))}
                          >
                            {formatTenge(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Utilities */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Utilities</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.utilities}
                          onChange={(e) => setLocalData(prev => ({ ...prev, utilities: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expensePresets.utilities.map((amount) => (
                          <Button
                            key={amount}
                            variant={localData.utilities === amount ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setLocalData(prev => ({ ...prev, utilities: amount }))}
                          >
                            {formatTenge(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Subscriptions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Subscriptions & Services</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.subscriptions}
                          onChange={(e) => setLocalData(prev => ({ ...prev, subscriptions: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expensePresets.subscriptions.map((amount) => (
                          <Button
                            key={amount}
                            variant={localData.subscriptions === amount ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setLocalData(prev => ({ ...prev, subscriptions: amount }))}
                          >
                            {formatTenge(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Entertainment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Entertainment</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.entertainment}
                          onChange={(e) => setLocalData(prev => ({ ...prev, entertainment: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expensePresets.entertainment.map((amount) => (
                          <Button
                            key={amount}
                            variant={localData.entertainment === amount ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setLocalData(prev => ({ ...prev, entertainment: amount }))}
                          >
                            {formatTenge(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Groceries (optional) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Groceries <span className="text-muted-foreground">(optional)</span></Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.groceries}
                          onChange={(e) => setLocalData(prev => ({ ...prev, groceries: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {expensePresets.groceries.map((amount) => (
                          <Button
                            key={amount}
                            variant={localData.groceries === amount ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setLocalData(prev => ({ ...prev, groceries: amount }))}
                          >
                            {formatTenge(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mortgage */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Mortgage Payment <span className="text-muted-foreground">(if any)</span></Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.mortgage}
                          onChange={(e) => setLocalData(prev => ({ ...prev, mortgage: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Monthly Expenses</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatTenge(totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Loans & Debts */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Active Loans & Debts</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add any loans or credit obligations you have
                    </p>
                  </div>

                  {/* Existing Loans */}
                  {localData.loans.length > 0 && (
                    <div className="space-y-2">
                      {localData.loans.map((loan) => (
                        <div key={loan.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="font-medium">{loan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTenge(loan.amount)} at {loan.interestRate}% for {loan.duration} months
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Monthly</p>
                              <p className="font-semibold text-primary">{formatTenge(loan.monthlyPayment)}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeLoan(loan.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Loan */}
                  <div className="p-4 border border-border rounded-lg space-y-4">
                    <h4 className="font-medium">Add a Loan</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Loan Name</Label>
                        <Input
                          placeholder="e.g., Car Loan, Personal Loan"
                          value={newLoan.name}
                          onChange={(e) => setNewLoan(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Loan Amount (₸)</Label>
                        <Input
                          type="number"
                          value={newLoan.amount}
                          onChange={(e) => setNewLoan(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Interest Rate (%)</Label>
                        <Input
                          type="number"
                          value={newLoan.interestRate}
                          onChange={(e) => setNewLoan(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (months)</Label>
                        <Input
                          type="number"
                          value={newLoan.duration}
                          onChange={(e) => setNewLoan(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {newLoan.name && newLoan.amount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Estimated monthly payment: <span className="font-semibold text-primary">
                          {formatTenge(Math.round(calculateMonthlyPayment(newLoan.amount, newLoan.interestRate, newLoan.duration)))}
                        </span>
                      </p>
                    )}

                    <Button onClick={addLoan} disabled={!newLoan.name || newLoan.amount <= 0}>
                      Add Loan
                    </Button>
                  </div>

                  {localData.loans.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No loans added. If you have no debts, you can skip to the next step.
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Savings - Split Structure */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Savings Structure</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up your savings plan with cash and deposits
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Cash Savings */}
                    <div className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <Label className="text-sm font-medium">Cash Savings (Card/Cash Balance)</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Money that does NOT grow - used for liquidity and emergencies
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={localData.cashSavings}
                          onChange={(e) => setLocalData(prev => ({ ...prev, cashSavings: Number(e.target.value) }))}
                          className="h-11"
                        />
                        <span className="text-muted-foreground">₸</span>
                      </div>
                      <Slider
                        value={[localData.cashSavings]}
                        onValueChange={([value]) => setLocalData(prev => ({ ...prev, cashSavings: value }))}
                        min={0}
                        max={5000000}
                        step={50000}
                        className="py-2"
                      />
                    </div>

                    {/* Deposit Savings */}
                    <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <Label className="text-sm font-medium">Deposit Savings (Investment)</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Money on deposit that grows with interest - used in projections
                      </p>
                      
                      {/* Current Deposit Balance */}
                      <div className="space-y-2">
                        <Label className="text-xs">Current Deposit Balance</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={localData.depositSavings}
                            onChange={(e) => setLocalData(prev => ({ ...prev, depositSavings: Number(e.target.value) }))}
                            className="h-10"
                          />
                          <span className="text-muted-foreground">₸</span>
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-xs">Deposit Interest Rate</Label>
                          <span className="text-xs font-medium">{localData.depositInterestRate}% / year</span>
                        </div>
                        <Slider
                          value={[localData.depositInterestRate]}
                          onValueChange={([value]) => setLocalData(prev => ({ ...prev, depositInterestRate: value }))}
                          min={5}
                          max={20}
                          step={0.5}
                          className="py-2"
                        />
                      </div>

                      {/* Monthly Contribution */}
                      <div className="space-y-2">
                        <Label className="text-xs">Monthly Deposit Contribution</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={localData.monthlyDepositContribution}
                            onChange={(e) => setLocalData(prev => ({ ...prev, monthlyDepositContribution: Number(e.target.value) }))}
                            className="h-10"
                          />
                          <span className="text-muted-foreground">₸</span>
                        </div>
                        <Slider
                          value={[localData.monthlyDepositContribution]}
                          onValueChange={([value]) => setLocalData(prev => ({ ...prev, monthlyDepositContribution: value }))}
                          min={0}
                          max={Math.max(200000, localData.monthlyIncome * 0.5)}
                          step={5000}
                          className="py-2"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Savings</span>
                        <span className="font-medium">{formatTenge(localData.cashSavings + localData.depositSavings)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Contribution</span>
                        <span className="font-medium">{formatTenge(localData.monthlyDepositContribution)}</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Free Cash Flow</span>
                          <span className={cn(
                            "font-semibold",
                            freeCashFlow >= 0 ? "text-teal-500" : "text-red-500"
                          )}>
                            {formatTenge(freeCashFlow)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {freeCashFlow < 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-500">
                          Your expenses exceed your income. Consider reducing expenses or savings contribution.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={nextStep} className="gap-2">
              {currentStep === 4 ? "Complete Setup" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
