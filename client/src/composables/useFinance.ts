import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { IncomeProfile, FixedCost, CareExpense, FinanceSummary } from '@/types/finance'
import { useFamily } from './useFamily'
import { calculateFinanceSummary } from '@/lib/financeCalc'

const incomes = ref<Record<string, IncomeProfile>>({})
const fixedCosts = ref<Record<string, FixedCost>>({})
const careExpenses = ref<Record<string, CareExpense>>({})
let subscribedFamilyId: string | null = null

function subscribeToFinance(fId: string): void {
  if (subscribedFamilyId === fId) return
  subscribedFamilyId = fId

  const financeNode = gun.get('families').get(fId).get('finance')

  // Subscribe to incomes
  financeNode
    .get('incomes')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...incomes.value }
        delete updated[key]
        incomes.value = updated
        return
      }
      if (typeof data === 'object') {
        incomes.value = {
          ...incomes.value,
          [key]: {
            id: key,
            memberId: data.memberId ?? '',
            hourlyRate: Number(data.hourlyRate) || 0,
            hoursPerWeek: Number(data.hoursPerWeek) || 0,
            taxRate: Number(data.taxRate) || 0,
            type: data.type ?? 'employed',
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })

  // Subscribe to fixed costs
  financeNode
    .get('fixedCosts')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...fixedCosts.value }
        delete updated[key]
        fixedCosts.value = updated
        return
      }
      if (typeof data === 'object') {
        fixedCosts.value = {
          ...fixedCosts.value,
          [key]: {
            id: key,
            name: data.name ?? '',
            amount: Number(data.amount) || 0,
            category: data.category ?? 'other',
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })

  // Subscribe to care expenses
  financeNode
    .get('careExpenses')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...careExpenses.value }
        delete updated[key]
        careExpenses.value = updated
        return
      }
      if (typeof data === 'object') {
        careExpenses.value = {
          ...careExpenses.value,
          [key]: {
            id: key,
            childId: data.childId ?? '',
            provider: data.provider ?? '',
            monthlyCost: Number(data.monthlyCost) || 0,
            hoursPerWeek: Number(data.hoursPerWeek) || 0,
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })
}

export function useFinance() {
  const { familyId } = useFamily()

  watch(
    familyId,
    (newId) => {
      if (newId) {
        subscribeToFinance(newId)
      } else {
        incomes.value = {}
        fixedCosts.value = {}
        careExpenses.value = {}
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  const summary = computed<FinanceSummary>(() => {
    return calculateFinanceSummary(
      Object.values(incomes.value),
      Object.values(fixedCosts.value),
      Object.values(careExpenses.value),
    )
  })

  // --- Income CRUD ---

  function addIncome(data: Omit<IncomeProfile, 'id' | 'createdAt'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `income-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put({
        memberId: data.memberId,
        hourlyRate: data.hourlyRate,
        hoursPerWeek: data.hoursPerWeek,
        taxRate: data.taxRate,
        type: data.type,
        createdAt: now,
      } as any)

    return id
  }

  function updateIncome(id: string, data: Partial<Omit<IncomeProfile, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put(data as any)
  }

  function removeIncome(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put(null as any)
  }

  // --- Fixed Cost CRUD ---

  function addFixedCost(data: Omit<FixedCost, 'id' | 'createdAt'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `cost-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put({
        name: data.name,
        amount: data.amount,
        category: data.category,
        createdAt: now,
      } as any)

    return id
  }

  function updateFixedCost(id: string, data: Partial<Omit<FixedCost, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put(data as any)
  }

  function removeFixedCost(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put(null as any)
  }

  // --- Care Expense CRUD ---

  function addCareExpense(data: Omit<CareExpense, 'id' | 'createdAt'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `care-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put({
        childId: data.childId,
        provider: data.provider,
        monthlyCost: data.monthlyCost,
        hoursPerWeek: data.hoursPerWeek,
        createdAt: now,
      } as any)

    return id
  }

  function updateCareExpense(id: string, data: Partial<Omit<CareExpense, 'id'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put(data as any)
  }

  function removeCareExpense(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put(null as any)
  }

  return {
    incomes,
    fixedCosts,
    careExpenses,
    summary,
    addIncome,
    updateIncome,
    removeIncome,
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
    addCareExpense,
    updateCareExpense,
    removeCareExpense,
  }
}
