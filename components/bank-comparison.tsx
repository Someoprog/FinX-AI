"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Building, Star, Info, ExternalLink, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatTenge } from "@/lib/finance-context"
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

interface BankData {
  name: string
  logo: string
  logoUrl: string
  savingsRate: string
  depositRate12m: string
  minAmount: number
  features: string[]
  rating: number
  highlight?: boolean
}

const bankData: BankData[] = [
  {
    name: "Kaspi Bank",
    logo: "K",
    logoUrl: "/images/kaspi-20bank-20logo.png",
    savingsRate: "12.0%",
    depositRate12m: "14.5%",
    minAmount: 0,
    features: ["Mobile-first", "Instant transfers", "No minimum", "Flexible terms"],
    rating: 4.8,
    highlight: true,
  },
  {
    name: "Halyk Bank",
    logo: "H",
    logoUrl: "/images/halyk-20bank-20logo.webp",
    savingsRate: "11.5%",
    depositRate12m: "14.0%",
    minAmount: 50000,
    features: ["Wide network", "Corporate services", "Multi-currency", "Investment options"],
    rating: 4.5,
  },
  {
    name: "Bank CenterCredit",
    logo: "C",
    logoUrl: "/images/bank-20center-20credit-20image-20logo.jpg",
    savingsRate: "11.0%",
    depositRate12m: "13.5%",
    minAmount: 100000,
    features: ["Premium banking", "Financial advice", "Business accounts", "International"],
    rating: 4.3,
  },
  {
    name: "Home Credit Bank",
    logo: "HC",
    logoUrl: "/images/home-20kredit-20bank-20logo.jpeg",
    savingsRate: "12.5%",
    depositRate12m: "15.0%",
    minAmount: 30000,
    features: ["Consumer focus", "Quick deposits", "Online banking", "Bonus programs"],
    rating: 4.2,
  },
  {
    name: "Freedom Finance Bank",
    logo: "FF",
    logoUrl: "/images/freedom-20bank-20logo.png",
    savingsRate: "13.0%",
    depositRate12m: "15.5%",
    minAmount: 10000,
    features: ["Investment platform", "Modern app", "Low fees", "Stock access"],
    rating: 4.6,
  },
  {
    name: "ForteBank",
    logo: "F",
    logoUrl: "/images/forte-20bank-20logo.webp",
    savingsRate: "11.8%",
    depositRate12m: "14.2%",
    minAmount: 25000,
    features: ["Digital banking", "SME services", "Cashback", "Insurance"],
    rating: 4.4,
  },
]

const faqItems = [
  {
    question: "How do deposit rates work in Kazakhstan?",
    answer: "Deposit rates in Kazakhstan are typically expressed as annual percentage rates. Most banks offer higher rates for longer-term deposits (12-24 months) compared to savings accounts. Interest can be paid monthly, quarterly, or at maturity depending on the product."
  },
  {
    question: "Are deposits insured in Kazakhstan?",
    answer: "Yes, deposits in Kazakhstan are protected by the Kazakhstan Deposit Insurance Fund (KDIF). Coverage extends up to 20 million tenge per depositor per bank for tenge deposits. Foreign currency deposits have different coverage limits."
  },
  {
    question: "What should I consider when choosing a bank?",
    answer: "Consider interest rates, minimum deposit requirements, withdrawal flexibility, mobile banking quality, branch accessibility, and additional services. Higher rates may come with longer lock-in periods or higher minimum amounts."
  },
  {
    question: "Can I open multiple deposit accounts?",
    answer: "Yes, you can open deposit accounts at multiple banks. This can be a strategy to diversify risk and take advantage of different promotional rates. Remember that deposit insurance limits apply per bank."
  },
]

export function BankComparison() {
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
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bank Deposit Rates</h1>
          <p className="text-muted-foreground">Compare savings and deposit rates from Kazakhstan banks</p>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Sample Demo Data for Comparison Only</p>
            <p className="text-sm text-muted-foreground mt-1">
              The rates shown below are illustrative examples for demonstration purposes. 
              Actual rates may vary and should be verified directly with each bank before making financial decisions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Highest Savings Rate</p>
              <p className="text-xl font-bold text-success">13.0%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Highest 12m Deposit</p>
              <p className="text-xl font-bold text-primary">15.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Building className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Banks Compared</p>
              <p className="text-xl font-bold text-accent">{bankData.length}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Rate Comparison Table</CardTitle>
            <CardDescription>Compare key rates and features across major banks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Bank</TableHead>
                    <TableHead className="text-center">Savings Rate</TableHead>
                    <TableHead className="text-center">12-Month Deposit</TableHead>
                    <TableHead className="text-center">Minimum</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankData.map((bank) => (
                    <TableRow 
                      key={bank.name}
                      className={cn(bank.highlight && "bg-primary/5")}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                            <Image
                              src={bank.logoUrl || "/placeholder.svg"}
                              alt={`${bank.name} logo`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            {bank.highlight && (
                              <Badge variant="outline" className="text-xs mt-1">Popular</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-success">{bank.savingsRate}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">{bank.depositRate12m}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {bank.minAmount === 0 ? (
                          <Badge variant="outline" className="text-success border-success/30">No min</Badge>
                        ) : (
                          <span className="text-muted-foreground">{formatTenge(bank.minAmount)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{bank.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Cards (Mobile-friendly view) */}
      <motion.div variants={itemVariants} className="lg:hidden space-y-4">
        <h2 className="text-lg font-semibold">Bank Details</h2>
        {bankData.map((bank) => (
          <Card key={bank.name} className={cn(bank.highlight && "border-primary/30")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                  <Image
                    src={bank.logoUrl || "/placeholder.svg"}
                    alt={`${bank.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{bank.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{bank.rating}</span>
                    </div>
                  </div>
                  {bank.highlight && (
                    <Badge variant="outline" className="text-xs mt-1">Popular Choice</Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Savings</p>
                  <p className="font-semibold text-success">{bank.savingsRate}</p>
                </div>
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">12m Deposit</p>
                  <p className="font-semibold text-primary">{bank.depositRate12m}</p>
                </div>
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Minimum</p>
                  <p className="font-semibold text-sm">
                    {bank.minAmount === 0 ? "None" : `${bank.minAmount / 1000}k`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {bank.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Features Comparison */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Bank Features</CardTitle>
            <CardDescription>Key features and services offered by each bank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Bank</TableHead>
                    <TableHead>Key Features</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankData.map((bank) => (
                    <TableRow key={bank.name}>
                      <TableCell className="font-medium">{bank.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {bank.features.map((feature) => (
                            <Badge key={feature} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions about banking and deposits in Kazakhstan</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Tips for Choosing the Right Deposit</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Compare effective rates</p>
                  <p className="text-sm text-muted-foreground">Look at the annual effective rate, not just the nominal rate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Check withdrawal terms</p>
                  <p className="text-sm text-muted-foreground">Understand penalties for early withdrawal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Consider accessibility</p>
                  <p className="text-sm text-muted-foreground">Mobile app quality and branch network matter</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium">Diversify deposits</p>
                  <p className="text-sm text-muted-foreground">Spread large amounts across multiple banks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
