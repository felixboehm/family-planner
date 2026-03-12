import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { Category } from '@/types/family'
import { useFamily } from './useFamily'
import { defaultCategories } from '@/data/defaultCategories'

const categories = ref<Record<string, Category>>({})
let subscribedFamilyId: string | null = null

function subscribeToCategories(fId: string): void {
  if (subscribedFamilyId === fId) return
  subscribedFamilyId = fId

  gun
    .get('families')
    .get(fId)
    .get('categories')
    .map()
    .on((data: any, key: string) => {
      if (data === null || data === undefined) {
        const updated = { ...categories.value }
        delete updated[key]
        categories.value = updated
        return
      }
      if (typeof data === 'object') {
        categories.value = {
          ...categories.value,
          [key]: {
            id: key,
            name: data.name ?? '',
            emoji: data.emoji ?? '',
            type: data.type ?? 'need',
            weight: data.weight ?? 'family',
            visibility: data.visibility ?? 'family',
            isDefault: data.isDefault ?? false,
            createdAt: data.createdAt ?? 0,
          },
        }
      }
    })
}

export function useCategories() {
  const { familyId } = useFamily()

  watch(
    familyId,
    (newId) => {
      if (newId) {
        subscribeToCategories(newId)
      } else {
        categories.value = {}
        subscribedFamilyId = null
      }
    },
    { immediate: true },
  )

  const categoryList = computed(() =>
    Object.values(categories.value).sort((a, b) => {
      // needs first, then wishes
      if (a.type !== b.type) return a.type === 'need' ? -1 : 1
      return a.name.localeCompare(b.name)
    }),
  )

  const needCategories = computed(() =>
    categoryList.value.filter((c) => c.type === 'need'),
  )

  const wishCategories = computed(() =>
    categoryList.value.filter((c) => c.type === 'wish'),
  )

  function initDefaultCategories(): void {
    if (!familyId.value) return

    const catNode = gun.get('families').get(familyId.value).get('categories')

    for (const cat of defaultCategories) {
      catNode.get(cat.id).once((existing: any) => {
        if (!existing || !existing.name) {
          catNode.get(cat.id).put({
            name: cat.name,
            emoji: cat.emoji,
            type: cat.type,
            weight: cat.weight,
            visibility: cat.visibility,
            isDefault: cat.isDefault,
            createdAt: cat.createdAt,
          })
        }
      })
    }
  }

  function addCategory(data: Omit<Category, 'id' | 'createdAt' | 'isDefault'>): string {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `cat-${crypto.randomUUID()}`
    const now = Date.now()

    gun
      .get('families')
      .get(familyId.value)
      .get('categories')
      .get(id)
      .put({
        name: data.name,
        emoji: data.emoji,
        type: data.type,
        weight: data.weight,
        visibility: data.visibility,
        isDefault: false,
        createdAt: now,
      })

    return id
  }

  function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    gun
      .get('families')
      .get(familyId.value)
      .get('categories')
      .get(id)
      .put(data as any)
  }

  function removeCategory(id: string): void {
    if (!familyId.value) throw new Error('Keine Familie ausgewaehlt')

    const cat = categories.value[id]
    if (cat?.isDefault) return // cannot remove default categories

    gun
      .get('families')
      .get(familyId.value)
      .get('categories')
      .get(id)
      .put(null as any)
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.value[id]
  }

  return {
    categories,
    categoryList,
    needCategories,
    wishCategories,
    initDefaultCategories,
    addCategory,
    updateCategory,
    removeCategory,
    getCategoryById,
  }
}
