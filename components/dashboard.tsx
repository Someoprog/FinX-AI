"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, 
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  BarChart3, Target, Shield, Calendar
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinance, formatTenge } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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

const TIME_RANGES = [
  { value: "12", label: "1 Year", months: 12 },
  { value: "60", label: "5 Years", months: 60 },
  { value: "120", label: "10 Years", months: 120 },
  { value: "240", label: "20 Years", months: 240 },
  { value: "360", label: "30 Years", months: 360 },
]

export function Dashboard() {
  const { data } = useFinance()
  const [projectionRange, setProjectionRange] = useState("12")

  // Financial Status Labels + Colors based on score ranges
  // 0-39: High Risk (red), 40-69: Moderate Risk (yellow/orange), 70-100: Healthy (green)
  const getRiskLevel = (score: number): { label: string; color: string; bg: string; border: string; hexColor: string } => {
    if (score >= 70) return { 
      label: "Healthy", 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      border: "border-emerald-500/30",
      hexColor: "#10B981"
    }
    if (score >= 40) return { 
      label: "Moderate Risk", 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      border: "border-amber-500/30",
      hexColor: "#F59E0B"
    }
    return { 
      label: "High Risk", 
      color: "text-red-500", 
      bg: "bg-red-500/10", 
      border: "border-red-500/30",
      hexColor: "#EF4444"
    }
  }

  const riskLevel = getRiskLevel(data.riskScore)

  // Expense breakdown data for pie chart
  const expenseData = [
    { name: "Rent", value: data.rent, color: "#0d9488" },
    { name: "Utilities", value: data.utilities, color: "#14b8a6" },
    { name: "Subscriptions", value: data.subscriptions, color: "#2dd4bf" },
    { name: "Entertainment", value: data.entertainment, color: "#5eead4" },
    { name: "Groceries", value: data.groceries, color: "#99f6e4" },
    { name: "Mortgage", value: data.mortgage, color: "#0891b2" },
    { name: "Loan Payments", value: data.totalMonthlyDebtPayment, color: "#06b6d4" },
  ].filter(item => item.value > 0)

  // Monthly projection data with dynamic range
  const projectionMonths = parseInt(projectionRange)
  const monthlyProjection = useMemo(() => {
    const monthlyDebtReduction = data.totalMonthlyDebtPayment * 0.4 // Approximate principal payment
    // Use user's deposit interest rate, default to 14% if not set
    const monthlyInterestRate = (data.depositInterestRate || 14) / 100 / 12
    
    let debtZeroMonth: number | null = null
    
    return Array.from({ length: projectionMonths }, (_, i) => {
      const monthIndex = i + 1
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      
      // Calculate debt with reducing balance
      const projectedDebt = Math.max(0, data.totalDebt - (monthlyDebtReduction * monthIndex))
      
      // Track when debt reaches zero
      if (projectedDebt === 0 && debtZeroMonth === null && data.totalDebt > 0) {
        debtZeroMonth = monthIndex
      }
      
      // Calculate savings: cash stays constant, deposit grows with compound interest
      let projectedDepositSavings = data.depositSavings || 0
      for (let m = 0; m < monthIndex; m++) {
        projectedDepositSavings = projectedDepositSavings * (1 + monthlyInterestRate) + (data.monthlyDepositContribution || 0)
      }
      // Total savings = cash (stays constant) + deposit (grows)
      const projectedSavings = (data.cashSavings || 0) + projectedDepositSavings
      
      // Format label based on time range
      let label: string
      if (projectionMonths <= 12) {
        label = date.toLocaleString('en', { month: 'short' })
      } else if (projectionMonths <= 60) {
        label = monthIndex % 6 === 0 ? `${Math.floor(monthIndex / 12)}y${monthIndex % 12 ? ` ${monthIndex % 12}m` : ''}` : ''
      } else {
        label = monthIndex % 12 === 0 ? `Year ${monthIndex / 12}` : ''
      }
      
      return {
        monthIndex,
        month: label,
        savings: Math.round(projectedSavings),
        debt: Math.round(projectedDebt),
        debtZero: projectedDebt === 0 && data.totalDebt > 0,
      }
    })
  }, [projectionMonths, data.cashSavings, data.depositSavings, data.monthlyDepositContribution, data.depositInterestRate, data.totalDebt, data.totalMonthlyDebtPayment])

  // Income breakdown data
  const incomeBreakdown = [
    { name: "Fixed Expenses", amount: data.totalExpenses },
    { name: "Loan Payments", amount: data.totalMonthlyDebtPayment },
    { name: "Deposit Contribution", amount: data.monthlyDepositContribution || 0 },
    { name: "Free Cash", amount: Math.max(0, data.freeCashFlow) },
  ]

  const stats = [
    {
      title: "Monthly Income",
      value: formatTenge(data.monthlyIncome),
      icon: Wallet,
      trend: null,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Fixed Expenses",
      value: formatTenge(data.totalExpenses),
      icon: ArrowDownRight,
      trend: data.monthlyIncome > 0 ? Math.round((data.totalExpenses / data.monthlyIncome) * 100) : 0,
      trendLabel: "of income",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Free Cash Flow",
      value: formatTenge(data.freeCashFlow),
      icon: data.freeCashFlow >= 0 ? TrendingUp : TrendingDown,
      trend: null,
      color: data.freeCashFlow >= 0 ? "text-success" : "text-destructive",
      bg: data.freeCashFlow >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      title: "Total Debt",
      value: formatTenge(data.totalDebt),
      icon: CreditCard,
      trend: data.monthlyIncome > 0 ? Math.round(data.debtToIncomeRatio * 100) : 0,
      trendLabel: "DTI ratio",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ]

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Financial Dashboard</h1>
        <p className="text-base text-muted-foreground mt-1">Your complete financial overview at a glance</p>
      </motion.div>

      {/* Key Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-extrabold tracking-tight">{stat.value}</p>
                  {stat.trend !== null && (
                    <p className="text-sm text-muted-foreground">
                      <span className={cn("font-semibold", stat.color)}>{stat.trend}%</span> {stat.trendLabel}
                    </p>
                  )}
                </div>
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Risk Score & Debt Ratio */}
      <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-2">
        {/* Financial Risk Score */}
        <Card className={cn("relative overflow-hidden border-2", riskLevel.border)}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Financial Risk Score
            </CardTitle>
            <CardDescription>Based on your debt load, savings discipline, and expense ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={riskLevel.hexColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(data.riskScore / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold tracking-tight">{data.riskScore}</span>
                    <span className="text-lg font-medium text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", riskLevel.bg, riskLevel.color)}>
                  {data.riskScore >= 70 ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  {riskLevel.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.riskScore >= 70
                    ? "Your finances are in good shape. Keep up the healthy habits!"
                    : data.riskScore >= 40
                    ? "Moderate risk position. Consider improving savings or reducing expenses."
                    : "Your financial health needs attention. Focus on building emergency savings and reducing debt."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt-to-Income Ratio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Debt-to-Income Ratio
            </CardTitle>
            <CardDescription>Monthly debt payments vs monthly income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Ratio</span>
                <span className={cn(
                  "text-lg font-bold",
                  data.debtToIncomeRatio <= 0.2 ? "text-success" : 
                  data.debtToIncomeRatio <= 0.4 ? "text-warning" : "text-destructive"
                )}>
                  {Math.round(data.debtToIncomeRatio * 100)}%
                </span>
              </div>
              <Progress 
                value={Math.min(data.debtToIncomeRatio * 100, 100)} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="text-success">20% Good</span>
                <span className="text-warning">40% Caution</span>
                <span className="text-destructive">50%+ High</span>
              </div>
            </div>
            
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Debt Payment</span>
                <span className="font-semibold text-base">{formatTenge(data.totalMonthlyDebtPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income</span>
                <span className="font-semibold text-base">{formatTenge(data.monthlyIncome)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-2">
        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>How your money is allocated</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatTenge(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                          fontSize: '14px',
                          fontWeight: 500,
                          padding: '8px 12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: 600 }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {expenseData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-base tabular-nums">{formatTenge(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Income Allocation</CardTitle>
            <CardDescription>Monthly budget breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeBreakdown} layout="vertical">
                  <XAxis type="number" tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip 
                    formatter={(value: number) => formatTenge(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: 600 }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Savings Projection */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Financial Projection
                </CardTitle>
                <CardDescription>Projected savings growth and debt reduction</CardDescription>
              </div>
              <Select value={projectionRange} onValueChange={setProjectionRange}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProjection}>
                  <XAxis dataKey="month" tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 13, fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip 
                    formatter={(value: number) => formatTenge(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '8px 12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: 600 }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px' }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    name="Savings" 
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    dot={{ fill: '#14b8a6', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#14b8a6', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="debt" 
                    name="Debt" 
                    stroke="#f97316"
                    strokeWidth={2.5}
                    dot={{ fill: '#f97316', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#f97316', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Footer */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <PiggyBank className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Savings</p>
              <p className="text-2xl font-extrabold tracking-tight text-success tabular-nums">{formatTenge(data.currentSavings)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ArrowUpRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Savings Goal</p>
              <p className="text-2xl font-extrabold tracking-tight text-primary tabular-nums">{formatTenge(data.plannedMonthlySavings)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-extrabold tracking-tight text-accent tabular-nums">
                {data.monthlyIncome > 0 
                  ? `${Math.round((data.plannedMonthlySavings / data.monthlyIncome) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
