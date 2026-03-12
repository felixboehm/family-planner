import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { IncomeProfile, FixedCost, CareExpense, FinanceSummary } from '@/types/finance'
import { useFamily } from './useFamily'
import { calculateFinanceSummary } from '@/lib/financeCalc'
import { encryptWithFamilyKey, decryptWithFamilyKey } from '@/lib/sea'

const incomes = ref<Record<string, IncomeProfile>>({})
const fixedCosts = ref<Record<string, FixedCost>>({})
const careExpenses = ref<Record<string, CareExpense>>({})
let subscribedFamilyPub: string | null = null

function subscribeToFinance(fPub: string, familyPair: any): void {
  if (subscribedFamilyPub === fPub) return
  subscribedFamilyPub = fPub

  const financeNode = gun.user(fPub).get('finance')

  // Subscribe to incomes
  financeNode
    .get('incomes')
    .map()
    .on(async (data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...incomes.value }
        delete updated[key]
        incomes.value = updated
        return
      }
      // Decrypt if encrypted
      let record = data
      if (typeof data === 'string' && familyPair) {
        const decrypted = await decryptWithFamilyKey(data, familyPair)
        if (decrypted) record = decrypted
      }
      if (typeof record === 'object') {
        incomes.value = {
          ...incomes.value,
          [key]: {
            id: key,
            memberId: record.memberId ?? '',
            hourlyRate: Number(record.hourlyRate) || 0,
            hoursPerWeek: Number(record.hoursPerWeek) || 0,
            taxRate: Number(record.taxRate) || 0,
            type: record.type ?? 'employed',
            createdAt: record.createdAt ?? 0,
          },
        }
      }
    })

  // Subscribe to fixed costs
  financeNode
    .get('fixedCosts')
    .map()
    .on(async (data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...fixedCosts.value }
        delete updated[key]
        fixedCosts.value = updated
        return
      }
      let record = data
      if (typeof data === 'string' && familyPair) {
        const decrypted = await decryptWithFamilyKey(data, familyPair)
        if (decrypted) record = decrypted
      }
      if (typeof record === 'object') {
        fixedCosts.value = {
          ...fixedCosts.value,
          [key]: {
            id: key,
            name: record.name ?? '',
            amount: Number(record.amount) || 0,
            category: record.category ?? 'other',
            createdAt: record.createdAt ?? 0,
          },
        }
      }
    })

  // Subscribe to care expenses
  financeNode
    .get('careExpenses')
    .map()
    .on(async (data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...careExpenses.value }
        delete updated[key]
        careExpenses.value = updated
        return
      }
      let record = data
      if (typeof data === 'string' && familyPair) {
        const decrypted = await decryptWithFamilyKey(data, familyPair)
        if (decrypted) record = decrypted
      }
      if (typeof record === 'object') {
        careExpenses.value = {
          ...careExpenses.value,
          [key]: {
            id: key,
            childId: record.childId ?? '',
            provider: record.provider ?? '',
            monthlyCost: Number(record.monthlyCost) || 0,
            hoursPerWeek: Number(record.hoursPerWeek) || 0,
            createdAt: record.createdAt ?? 0,
          },
        }
      }
    })
}

export function useFinance() {
  const { familyPub, familyPair, familyCert } = useFamily()

  watch(
    familyPub,
    (newPub) => {
      if (newPub) {
        subscribeToFinance(newPub, familyPair.value)
      } else {
        incomes.value = {}
        fixedCosts.value = {}
        careExpenses.value = {}
        subscribedFamilyPub = null
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

  async function addIncome(data: Omit<IncomeProfile, 'id' | 'createdAt'>): Promise<string> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `income-${crypto.randomUUID()}`
    const now = Date.now()
    const cert = familyCert.value

    const record = { ...data, createdAt: now }
    const encrypted = await encryptWithFamilyKey(record, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)

    return id
  }

  async function updateIncome(id: string, data: Partial<Omit<IncomeProfile, 'id'>>): Promise<void> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const existing = incomes.value[id]
    if (!existing) return

    const cert = familyCert.value
    const merged = { ...existing, ...data }
    const encrypted = await encryptWithFamilyKey(merged, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)
  }

  function removeIncome(id: string): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('finance')
      .get('incomes')
      .get(id)
      .put(null as any, null, { opt: { cert } } as any)
  }

  // --- Fixed Cost CRUD ---

  async function addFixedCost(data: Omit<FixedCost, 'id' | 'createdAt'>): Promise<string> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `cost-${crypto.randomUUID()}`
    const now = Date.now()
    const cert = familyCert.value

    const record = { ...data, createdAt: now }
    const encrypted = await encryptWithFamilyKey(record, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)

    return id
  }

  async function updateFixedCost(id: string, data: Partial<Omit<FixedCost, 'id'>>): Promise<void> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const existing = fixedCosts.value[id]
    if (!existing) return

    const cert = familyCert.value
    const merged = { ...existing, ...data }
    const encrypted = await encryptWithFamilyKey(merged, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)
  }

  function removeFixedCost(id: string): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('finance')
      .get('fixedCosts')
      .get(id)
      .put(null as any, null, { opt: { cert } } as any)
  }

  // --- Care Expense CRUD ---

  async function addCareExpense(data: Omit<CareExpense, 'id' | 'createdAt'>): Promise<string> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `care-${crypto.randomUUID()}`
    const now = Date.now()
    const cert = familyCert.value

    const record = { ...data, createdAt: now }
    const encrypted = await encryptWithFamilyKey(record, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)

    return id
  }

  async function updateCareExpense(id: string, data: Partial<Omit<CareExpense, 'id'>>): Promise<void> {
    if (!familyPub.value || !familyCert.value || !familyPair.value) throw new Error('Keine Familie ausgewaehlt')

    const existing = careExpenses.value[id]
    if (!existing) return

    const cert = familyCert.value
    const merged = { ...existing, ...data }
    const encrypted = await encryptWithFamilyKey(merged, familyPair.value)

    gun
      .user(familyPub.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put(encrypted as any, null, { opt: { cert } } as any)
  }

  function removeCareExpense(id: string): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('finance')
      .get('careExpenses')
      .get(id)
      .put(null as any, null, { opt: { cert } } as any)
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
