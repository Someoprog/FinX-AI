import { streamText, convertToModelMessages } from "ai"

function buildSystemPrompt(financialData: Record<string, unknown>): string {
  const fd = financialData as {
    monthlyIncome: number
    totalExpenses: number
    rent: number
    utilities: number
    subscriptions: number
    entertainment: number
    groceries: number
    mortgage: number
    freeCashFlow: number
    riskScore: number
    cashSavings: number
    depositSavings: number
    depositInterestRate: number
    monthlyDepositContribution: number
    totalDebt: number
    totalMonthlyDebtPayment: number
    debtToIncomeRatio: number
    loans: { name: string; amount: number; interestRate: number; monthlyPayment: number }[]
  }

  const totalSavings = fd.cashSavings + fd.depositSavings

  return `You are FinX AI Advisor — a friendly, knowledgeable financial assistant for users in Kazakhstan.
You provide personalized financial advice based on the user's real financial data shown below.
Always be helpful, concise, and actionable. Use Tenge (₸) as the currency.
Never recommend specific financial products or institutions unless asked.
If the user asks something unrelated to finance, gently redirect them.

USER'S FINANCIAL PROFILE:
- Monthly Income: ${fd.monthlyIncome.toLocaleString()} ₸
- Total Fixed Expenses: ${fd.totalExpenses.toLocaleString()} ₸
  - Rent: ${fd.rent.toLocaleString()} ₸
  - Utilities: ${fd.utilities.toLocaleString()} ₸
  - Subscriptions: ${fd.subscriptions.toLocaleString()} ₸
  - Entertainment: ${fd.entertainment.toLocaleString()} ₸
  - Groceries: ${fd.groceries.toLocaleString()} ₸
  - Mortgage: ${fd.mortgage.toLocaleString()} ₸
- Free Cash Flow: ${fd.freeCashFlow.toLocaleString()} ₸
- Financial Health Score: ${fd.riskScore}/100
- Cash Savings: ${fd.cashSavings.toLocaleString()} ₸
- Deposit Savings: ${fd.depositSavings.toLocaleString()} ₸ (at ${fd.depositInterestRate}% annual rate)
- Monthly Deposit Contribution: ${fd.monthlyDepositContribution.toLocaleString()} ₸
- Total Savings: ${totalSavings.toLocaleString()} ₸
- Total Debt: ${fd.totalDebt.toLocaleString()} ₸
- Monthly Debt Payments: ${fd.totalMonthlyDebtPayment.toLocaleString()} ₸
- Debt-to-Income Ratio: ${(fd.debtToIncomeRatio * 100).toFixed(1)}%
${
  fd.loans.length > 0
    ? `- Active Loans:\n${fd.loans
        .map(
          (l) =>
            `  • ${l.name}: ${l.amount.toLocaleString()} ₸ at ${l.interestRate}%, monthly payment ${l.monthlyPayment.toLocaleString()} ₸`
        )
        .join("\n")}`
    : "- No active loans"
}

GUIDELINES:
- Reference specific numbers from the user's profile when giving advice.
- If asked about budgeting, base advice on the actual expense categories above.
- Risk score interpretation: 0-39 = High Risk, 40-69 = Moderate, 70-100 = Healthy.
- Keep responses focused and under 300 words unless the user asks for detail.
- Use bullet points and clear formatting for readability.
- If the user has negative free cash flow, flag it as urgent.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, financialData } = body

    if (!messages || !financialData) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages and financialData" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const systemPrompt = buildSystemPrompt(financialData)

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 1024,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error)
    console.error("Chat API error:", errMessage)
    return new Response(
      JSON.stringify({ error: `AI request failed: ${errMessage}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

