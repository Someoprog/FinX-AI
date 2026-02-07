"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useFinance, formatTenge } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"

const SUGGESTED_QUESTIONS = [
  "How can I improve my financial health score?",
  "Should I focus on saving or paying off debt?",
  "How much should I have in an emergency fund?",
  "What expenses can I cut to save more?",
  "Is my debt-to-income ratio healthy?",
  "How long until I can be debt-free?",
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function formatMessageContent(content: string) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const processInline = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = []
      const regex = /\*\*(.*?)\*\*/g
      let lastIndex = 0
      let match: RegExpExecArray | null

      match = regex.exec(text)
      while (match !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }
        parts.push(
          <strong key={`bold-${i}-${match.index}`} className="font-semibold">
            {match[1]}
          </strong>
        )
        lastIndex = regex.lastIndex
        match = regex.exec(text)
      }
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }
      return parts.length > 0 ? parts : [text]
    }

    if (line.match(/^[\s]*[-*•]\s/)) {
      const bulletText = line.replace(/^[\s]*[-*•]\s/, "")
      elements.push(
        <li key={`line-${i}`} className="ml-4 list-disc text-sm leading-relaxed">
          {processInline(bulletText)}
        </li>
      )
    } else if (line.match(/^[\s]*\d+\.\s/)) {
      const numberedText = line.replace(/^[\s]*\d+\.\s/, "")
      elements.push(
        <li key={`line-${i}`} className="ml-4 list-decimal text-sm leading-relaxed">
          {processInline(numberedText)}
        </li>
      )
    } else if (line.trim() === "") {
      elements.push(<br key={`line-${i}`} />)
    } else {
      elements.push(
        <p key={`line-${i}`} className="text-sm leading-relaxed">
          {processInline(line)}
        </p>
      )
    }
  }

  return <div className="space-y-1">{elements}</div>
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function AIAdvisor() {
  const { data } = useFinance()
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const buildFinancialContext = useCallback(() => ({
    monthlyIncome: data.monthlyIncome,
    totalExpenses: data.totalExpenses,
    rent: data.rent,
    utilities: data.utilities,
    subscriptions: data.subscriptions,
    entertainment: data.entertainment,
    groceries: data.groceries,
    mortgage: data.mortgage,
    freeCashFlow: data.freeCashFlow,
    riskScore: data.riskScore,
    cashSavings: data.cashSavings,
    depositSavings: data.depositSavings,
    depositInterestRate: data.depositInterestRate,
    monthlyDepositContribution: data.monthlyDepositContribution,
    totalDebt: data.totalDebt,
    totalMonthlyDebtPayment: data.totalMonthlyDebtPayment,
    debtToIncomeRatio: data.debtToIncomeRatio,
    loans: data.loans.map((l) => ({
      name: l.name,
      amount: l.amount,
      interestRate: l.interestRate,
      monthlyPayment: l.monthlyPayment,
    })),
  }), [data])

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          financialData: buildFinancialContext(),
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"
  const hasError = status === "error"

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }, [])

  const handleSend = (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isLoading) return
    setInput("")
    sendMessage({ text: messageText })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Advisor</h1>
            <p className="text-muted-foreground">
              Ask me anything about your finances
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </motion.div>

      {/* Financial Context Summary */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Income: {formatTenge(data.monthlyIncome)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Expenses: {formatTenge(data.totalExpenses)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Free Cash: {formatTenge(data.freeCashFlow)}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              data.riskScore >= 70
                ? "border-success text-success"
                : data.riskScore >= 40
                  ? "border-warning text-warning"
                  : "border-destructive text-destructive"
            )}
          >
            Health Score: {data.riskScore}/100
          </Badge>
          {data.totalDebt > 0 && (
            <Badge variant="outline" className="text-xs">
              Debt: {formatTenge(data.totalDebt)}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="h-[480px] overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="p-4 bg-primary/10 rounded-2xl mb-4">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Your Personal Financial Advisor
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    I have access to your financial profile and can provide
                    personalized advice on budgeting, saving, debt management,
                    and more.
                  </p>

                  {/* Suggested Questions */}
                  <div className="grid gap-2 sm:grid-cols-2 w-full max-w-lg">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => handleSend(question)}
                        className="text-left px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const text = getUIMessageText(message)
                    if (!text) return null

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="shrink-0 p-2 bg-primary/10 rounded-lg h-fit mt-0.5">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {message.role === "assistant" ? (
                            formatMessageContent(text)
                          ) : (
                            <p className="text-sm leading-relaxed">{text}</p>
                          )}
                        </div>
                        {message.role === "user" && (
                          <div className="shrink-0 p-2 bg-primary rounded-lg h-fit mt-0.5">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Loading indicator */}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 justify-start">
                      <div className="shrink-0 p-2 bg-primary/10 rounded-lg h-fit mt-0.5">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-2xl px-4 py-3">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-[88px] left-1/2 -translate-x-1/2"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full shadow-lg"
                    onClick={scrollToBottom}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {hasError && (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive flex-1">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your finances..."
                  className="min-h-[44px] max-h-[120px] resize-none text-sm"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-11 w-11 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">
                AI Advisor uses your financial data to provide personalized
                guidance. Always verify important financial decisions with a
                professional.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
