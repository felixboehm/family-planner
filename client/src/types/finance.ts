export type EmploymentType = 'employed' | 'self-employed' | 'freelance' | 'part-time' | 'mini-job'

export interface IncomeProfile {
  id: string
  memberId: string
  hourlyRate: number
  hoursPerWeek: number
  taxRate: number // 0-100
  type: EmploymentType
  createdAt: number
}

export interface FixedCost {
  id: string
  name: string
  amount: number // monthly
  category: 'housing' | 'insurance' | 'transport' | 'subscriptions' | 'food' | 'other'
  createdAt: number
}

export interface CareExpense {
  id: string
  childId: string
  provider: string // e.g. "Kita Sonnenschein"
  monthlyCost: number
  hoursPerWeek: number
  createdAt: number
}

export interface FinanceSummary {
  totalGrossIncome: number
  totalNetIncome: number
  totalFixedCosts: number
  totalCareExpenses: number
  availableBudget: number
  incomeByMember: Record<string, { gross: number; net: number }>
}

export interface Scenario {
  id: string
  name: string
  adjustedIncomes: Record<string, { hoursPerWeek?: number; hourlyRate?: number }>
  adjustedCareExpenses: Record<string, { monthlyCost?: number; hoursPerWeek?: number }>
}
