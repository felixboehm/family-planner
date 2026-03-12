import type {
  IncomeProfile,
  FixedCost,
  CareExpense,
  FinanceSummary,
  Scenario,
} from '@/types/finance'

const WEEKS_PER_MONTH = 4.33

export function calculateNetIncome(profile: IncomeProfile): { gross: number; net: number } {
  const gross = profile.hourlyRate * profile.hoursPerWeek * WEEKS_PER_MONTH
  const net = gross * (1 - profile.taxRate / 100)
  return {
    gross: Math.round(gross * 100) / 100,
    net: Math.round(net * 100) / 100,
  }
}

export function calculateFinanceSummary(
  incomes: IncomeProfile[],
  fixedCosts: FixedCost[],
  careExpenses: CareExpense[],
): FinanceSummary {
  let totalGrossIncome = 0
  let totalNetIncome = 0
  const incomeByMember: Record<string, { gross: number; net: number }> = {}

  for (const income of incomes) {
    const { gross, net } = calculateNetIncome(income)
    totalGrossIncome += gross
    totalNetIncome += net

    if (!incomeByMember[income.memberId]) {
      incomeByMember[income.memberId] = { gross: 0, net: 0 }
    }
    incomeByMember[income.memberId].gross += gross
    incomeByMember[income.memberId].net += net
  }

  const totalFixedCosts = fixedCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalCareExpenses = careExpenses.reduce((sum, e) => sum + e.monthlyCost, 0)
  const availableBudget = totalNetIncome - totalFixedCosts - totalCareExpenses

  return {
    totalGrossIncome: Math.round(totalGrossIncome * 100) / 100,
    totalNetIncome: Math.round(totalNetIncome * 100) / 100,
    totalFixedCosts: Math.round(totalFixedCosts * 100) / 100,
    totalCareExpenses: Math.round(totalCareExpenses * 100) / 100,
    availableBudget: Math.round(availableBudget * 100) / 100,
    incomeByMember,
  }
}

export function calculateScenario(
  incomes: IncomeProfile[],
  fixedCosts: FixedCost[],
  careExpenses: CareExpense[],
  scenario: Scenario,
): FinanceSummary {
  // Apply income adjustments
  const adjustedIncomes = incomes.map((income) => {
    const adj = scenario.adjustedIncomes[income.id]
    if (!adj) return income
    return {
      ...income,
      hoursPerWeek: adj.hoursPerWeek ?? income.hoursPerWeek,
      hourlyRate: adj.hourlyRate ?? income.hourlyRate,
    }
  })

  // Apply care expense adjustments
  const adjustedCare = careExpenses.map((expense) => {
    const adj = scenario.adjustedCareExpenses[expense.id]
    if (!adj) return expense
    return {
      ...expense,
      monthlyCost: adj.monthlyCost ?? expense.monthlyCost,
      hoursPerWeek: adj.hoursPerWeek ?? expense.hoursPerWeek,
    }
  })

  return calculateFinanceSummary(adjustedIncomes, fixedCosts, adjustedCare)
}
