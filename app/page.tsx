"use client"

import { useState } from "react"
import { FinanceProvider, useFinance } from "@/lib/finance-context"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"
import { AIAdvisor } from "@/components/ai-advisor"
import { Calculators } from "@/components/calculators"
import { WhatIfSimulator } from "@/components/what-if-simulator"
import { BankComparison } from "@/components/bank-comparison"
import { ProgressTracking } from "@/components/progress-tracking"

function AppContent() {
  const { data } = useFinance()
  const [activeTab, setActiveTab] = useState("dashboard")


  if (!data.onboardingCompleted) {
    return <OnboardingWizard />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "advisor" && <AIAdvisor />}
        {activeTab === "calculator" && <Calculators />}
        {activeTab === "simulator" && <WhatIfSimulator />}
        {activeTab === "banks" && <BankComparison />}
        {activeTab === "progress" && <ProgressTracking />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                FinX - AI Financial Assistant
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                An AI-powered financial literacy and decision-support platform
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground">
                Startup MVP Demo - INFOMATRIX-ASIA 2026
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All financial data is for demonstration purposes only
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}
