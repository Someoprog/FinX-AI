"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { PiggyBank, CheckCircle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useFinance, formatTenge } from "@/lib/finance-context"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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

export function Calculators() {
  const { data } = useFinance()
  
  // Deposit Growth Calculator State
  const [calculatorInput, setCalculatorInput] = useState({
    initialDeposit: data.depositSavings || 100000,
    monthlyContribution: data.monthlyDepositContribution || 50000,
    interestRate: data.depositInterestRate || 14,
    duration: 24,
  })

  // Deposit Growth Calculator Logic
  const depositCalculation = useMemo(() => {
    const { initialDeposit, monthlyContribution, interestRate, duration } = calculatorInput
    const monthlyRate = interestRate / 100 / 12
    
    const monthlyData = []
    let totalBalance = initialDeposit
    
    for (let i = 1; i <= duration; i++) {
      totalBalance = totalBalance * (1 + monthlyRate) + monthlyContribution
      monthlyData.push({
        month: i,
        balance: Math.round(totalBalance),
        contributed: initialDeposit + (monthlyContribution * i),
      })
    }
    
    const totalContributed = initialDeposit + (monthlyContribution * duration)
    const interestEarned = Math.round(totalBalance - totalContributed)
    
    return {
      finalAmount: Math.round(totalBalance),
      totalContributed,
      interestEarned,
      monthlyData,
    }
  }, [calculatorInput])

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
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deposit Growth Calculator</h1>
          <p className="text-muted-foreground">Plan your savings and see how your deposit will grow over time</p>
        </div>
      </motion.div>

      {/* Deposit Growth Calculator */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              Calculator Inputs
            </CardTitle>
            <CardDescription>Adjust the values to see how your deposit will grow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Initial Deposit</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={calculatorInput.initialDeposit}
                  onChange={(e) => setCalculatorInput(prev => ({ ...prev, initialDeposit: Number(e.target.value) }))}
                />
                <span className="text-muted-foreground whitespace-nowrap">₸</span>
              </div>
              <Slider
                value={[calculatorInput.initialDeposit]}
                onValueChange={([value]) => setCalculatorInput(prev => ({ ...prev, initialDeposit: value }))}
                min={0}
                max={5000000}
                step={50000}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Monthly Contribution</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={calculatorInput.monthlyContribution}
                  onChange={(e) => setCalculatorInput(prev => ({ ...prev, monthlyContribution: Number(e.target.value) }))}
                />
                <span className="text-muted-foreground whitespace-nowrap">₸</span>
              </div>
              <Slider
                value={[calculatorInput.monthlyContribution]}
                onValueChange={([value]) => setCalculatorInput(prev => ({ ...prev, monthlyContribution: value }))}
                min={0}
                max={500000}
                step={5000}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Interest Rate (% per year)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={calculatorInput.interestRate}
                  onChange={(e) => setCalculatorInput(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <Slider
                value={[calculatorInput.interestRate]}
                onValueChange={([value]) => setCalculatorInput(prev => ({ ...prev, interestRate: value }))}
                min={5}
                max={25}
                step={0.5}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (months)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={calculatorInput.duration}
                  onChange={(e) => setCalculatorInput(prev => ({ ...prev, duration: Number(e.target.value) }))}
                />
                <span className="text-muted-foreground">months</span>
              </div>
              <Slider
                value={[calculatorInput.duration]}
                onValueChange={([value]) => setCalculatorInput(prev => ({ ...prev, duration: value }))}
                min={6}
                max={120}
                step={1}
                className="py-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Deposit Growth Projection</CardTitle>
            <CardDescription>Based on {calculatorInput.interestRate}% annual rate with monthly compounding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Final Amount</p>
                <p className="text-2xl font-bold text-primary">{formatTenge(depositCalculation.finalAmount)}</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground">Interest Earned</p>
                <p className="text-2xl font-bold text-emerald-500">{formatTenge(depositCalculation.interestEarned)}</p>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depositCalculation.monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    tickFormatter={(value) => `${value}m`}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip 
                    formatter={(value: number) => formatTenge(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="contributed" 
                    stackId="1"
                    stroke="#64748b"
                    fill="#94a3b8"
                    fillOpacity={0.4}
                    name="Contributed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stackId="2"
                    stroke="#0d9488"
                    fill="#14b8a6"
                    fillOpacity={0.6}
                    name="Total Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
              <p className="text-sm flex items-center gap-2 text-emerald-500">
                <CheckCircle className="h-4 w-4" />
                You would earn {formatTenge(depositCalculation.interestEarned)} in interest over {calculatorInput.duration} months
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Contributed</p>
            <p className="text-xl font-bold">{formatTenge(depositCalculation.totalContributed)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Monthly Growth Rate</p>
            <p className="text-xl font-bold">{(calculatorInput.interestRate / 12).toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Interest as % of Total</p>
            <p className="text-xl font-bold text-emerald-500">
              {depositCalculation.finalAmount > 0 
                ? `${((depositCalculation.interestEarned / depositCalculation.finalAmount) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
