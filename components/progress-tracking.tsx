"use client"

import { motion } from "framer-motion"
import { 
  Trophy, Star, Target, TrendingUp, Shield, PiggyBank, 
  CreditCard, Award, Zap, Lock, Check, Sparkles
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useFinance, formatTenge } from "@/lib/finance-context"
import { cn } from "@/lib/utils"

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

interface AchievementDisplay {
  id: string
  name: string
  description: string
  icon: typeof Trophy
  color: string
  bgColor: string
}

const achievementConfig: AchievementDisplay[] = [
  { 
    id: 'first-budget', 
    name: 'First Budget Created', 
    description: 'Complete your first financial profile',
    icon: Star,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  { 
    id: 'savings-started', 
    name: 'Savings Plan Started', 
    description: 'Set up a monthly savings goal',
    icon: PiggyBank,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  { 
    id: 'three-month-streak', 
    name: '3-Month Saving Streak', 
    description: 'Save consistently for 3 months',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  { 
    id: 'debt-improved', 
    name: 'Debt Ratio Improved', 
    description: 'Lower your debt-to-income ratio',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  { 
    id: 'expense-optimized', 
    name: 'Expense Optimization Applied', 
    description: 'Apply an expense reduction recommendation',
    icon: Target,
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  { 
    id: 'emergency-fund', 
    name: 'Emergency Fund Started', 
    description: 'Build savings equal to 1 month expenses',
    icon: Shield,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  { 
    id: 'smart-credit', 
    name: 'Smart Credit Avoided', 
    description: 'Avoid taking a risky loan',
    icon: CreditCard,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  { 
    id: 'risk-improved', 
    name: 'Risk Score Improved by 20+', 
    description: 'Improve your financial health score significantly',
    icon: Award,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  { 
    id: 'savings-goal', 
    name: 'Savings Goal Reached', 
    description: 'Reach your target savings amount',
    icon: Trophy,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
]

export function ProgressTracking() {
  const { data, achievements } = useFinance()

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const progressPercentage = (unlockedCount / achievements.length) * 100

  // Calculate financial health metrics
  const savingsRate = data.monthlyIncome > 0 ? (data.plannedMonthlySavings / data.monthlyIncome) * 100 : 0
  const expenseRate = data.monthlyIncome > 0 ? (data.totalExpenses / data.monthlyIncome) * 100 : 0
  const debtRate = data.debtToIncomeRatio * 100
  
  // Emergency fund progress (target: 3 months of expenses)
  const emergencyTarget = (data.totalExpenses + data.totalMonthlyDebtPayment) * 3
  const emergencyProgress = emergencyTarget > 0 ? Math.min((data.currentSavings / emergencyTarget) * 100, 100) : 0

  const getAchievementDisplay = (id: string) => {
    return achievementConfig.find(a => a.id === id) || {
      id,
      name: id,
      description: '',
      icon: Star,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
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
        <div className="p-3 bg-warning/10 rounded-xl">
          <Trophy className="h-6 w-6 text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Progress</h1>
          <p className="text-muted-foreground">Track your achievements and financial literacy journey</p>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(progressPercentage / 100) * 352} 352`}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Trophy className="h-6 w-6 text-warning mx-auto mb-1" />
                      <span className="text-2xl font-bold">{unlockedCount}</span>
                      <span className="text-sm text-muted-foreground">/{achievements.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold mb-2">Achievement Progress</h2>
                <p className="text-muted-foreground mb-4">
                  {unlockedCount === 0 
                    ? "Start your financial journey to unlock achievements!"
                    : unlockedCount < achievements.length / 2
                    ? "Great start! Keep building healthy financial habits."
                    : unlockedCount < achievements.length
                    ? "Excellent progress! You're on your way to financial mastery."
                    : "Congratulations! You've achieved financial literacy mastery!"}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {unlockedCount > 0 && (
                    <Badge className="bg-success text-success-foreground gap-1">
                      <Check className="h-3 w-3" />
                      {unlockedCount} Unlocked
                    </Badge>
                  )}
                  {unlockedCount < achievements.length && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" />
                      {achievements.length - unlockedCount} Remaining
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Health Metrics */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3">Financial Health Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Savings Rate</span>
                <PiggyBank className={cn(
                  "h-4 w-4",
                  savingsRate >= 20 ? "text-success" : savingsRate >= 10 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <p className="text-2xl font-bold mb-2">{Math.round(savingsRate)}%</p>
              <Progress 
                value={Math.min(savingsRate, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Target: 20%+</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Expense Ratio</span>
                <Target className={cn(
                  "h-4 w-4",
                  expenseRate <= 50 ? "text-success" : expenseRate <= 70 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <p className="text-2xl font-bold mb-2">{Math.round(expenseRate)}%</p>
              <Progress 
                value={Math.min(expenseRate, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Target: Below 50%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Debt-to-Income</span>
                <CreditCard className={cn(
                  "h-4 w-4",
                  debtRate <= 20 ? "text-success" : debtRate <= 40 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <p className="text-2xl font-bold mb-2">{Math.round(debtRate)}%</p>
              <Progress 
                value={Math.min(debtRate, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Target: Below 30%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Emergency Fund</span>
                <Shield className={cn(
                  "h-4 w-4",
                  emergencyProgress >= 100 ? "text-success" : emergencyProgress >= 50 ? "text-warning" : "text-destructive"
                )} />
              </div>
              <p className="text-2xl font-bold mb-2">{Math.round(emergencyProgress)}%</p>
              <Progress 
                value={emergencyProgress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Target: 3 months expenses</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const config = getAchievementDisplay(achievement.id)
            const Icon = config.icon
            
            return (
              <Card 
                key={achievement.id}
                className={cn(
                  "transition-all duration-300",
                  achievement.unlocked 
                    ? "border-2 border-primary/30 shadow-lg" 
                    : "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      achievement.unlocked ? config.bgColor : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-6 w-6 transition-all duration-300",
                        achievement.unlocked ? config.color : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-semibold",
                          !achievement.unlocked && "text-muted-foreground"
                        )}>
                          {config.name}
                        </h3>
                        {achievement.unlocked && (
                          <Check className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-primary mt-2">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                      {!achievement.unlocked && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Financial Journey */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Financial Journey
            </CardTitle>
            <CardDescription>Key milestones and goals to work towards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Milestone 1: Emergency Fund */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  emergencyProgress >= 100 ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {emergencyProgress >= 100 ? <Check className="h-5 w-5" /> : <span>1</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Build Emergency Fund</h4>
                  <p className="text-sm text-muted-foreground">Save 3 months of living expenses</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={emergencyProgress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{Math.round(emergencyProgress)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTenge(data.currentSavings)} / {formatTenge(emergencyTarget)}
                  </p>
                </div>
              </div>

              {/* Milestone 2: Debt Free */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  data.totalDebt === 0 ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {data.totalDebt === 0 ? <Check className="h-5 w-5" /> : <span>2</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Become Debt Free</h4>
                  <p className="text-sm text-muted-foreground">Pay off all outstanding loans</p>
                  {data.totalDebt > 0 ? (
                    <>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={0} className="flex-1 h-2" />
                        <span className="text-sm font-medium">In Progress</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Remaining: {formatTenge(data.totalDebt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-success mt-2">Congratulations! You're debt free!</p>
                  )}
                </div>
              </div>

              {/* Milestone 3: Healthy Savings Rate */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  savingsRate >= 20 ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {savingsRate >= 20 ? <Check className="h-5 w-5" /> : <span>3</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Achieve 20% Savings Rate</h4>
                  <p className="text-sm text-muted-foreground">Save at least 20% of your income monthly</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={Math.min((savingsRate / 20) * 100, 100)} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{Math.round(savingsRate)}%</span>
                  </div>
                </div>
              </div>

              {/* Milestone 4: Financial Health */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  data.riskScore >= 80 ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {data.riskScore >= 80 ? <Check className="h-5 w-5" /> : <span>4</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Excellent Financial Health</h4>
                  <p className="text-sm text-muted-foreground">Achieve a risk score of 80 or higher</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={(data.riskScore / 80) * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{data.riskScore}/80</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
