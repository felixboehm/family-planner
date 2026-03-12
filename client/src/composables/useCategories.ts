import { ref, computed, watch } from 'vue'
import gun from '@/lib/gun'
import type { Category } from '@/types/family'
import { useFamily } from './useFamily'
import { defaultCategories } from '@/data/defaultCategories'

const categories = ref<Record<string, Category>>({})
let subscribedFamilyPub: string | null = null

function subscribeToCategories(fPub: string): void {
  if (subscribedFamilyPub === fPub) return
  subscribedFamilyPub = fPub

  gun
    .user(fPub)
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
  const { familyPub, familyCert } = useFamily()

  watch(
    familyPub,
    (newPub) => {
      if (newPub) {
        subscribeToCategories(newPub)
      } else {
        categories.value = {}
        subscribedFamilyPub = null
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
    if (!familyPub.value || !familyCert.value) return

    const cert = familyCert.value
    const catNode = gun.user(familyPub.value).get('categories')

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
          } as any, null, { opt: { cert } } as any)
        }
      })
    }
  }

  function addCategory(data: Omit<Category, 'id' | 'createdAt' | 'isDefault'>): string {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const id = `cat-${crypto.randomUUID()}`
    const now = Date.now()
    const cert = familyCert.value

    gun
      .user(familyPub.value)
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
      } as any, null, { opt: { cert } } as any)

    return id
  }

  function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'isDefault'>>): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('categories')
      .get(id)
      .put(data as any, null, { opt: { cert } } as any)
  }

  function removeCategory(id: string): void {
    if (!familyPub.value || !familyCert.value) throw new Error('Keine Familie ausgewaehlt')

    const cat = categories.value[id]
    if (cat?.isDefault) return // cannot remove default categories

    const cert = familyCert.value

    gun
      .user(familyPub.value)
      .get('categories')
      .get(id)
      .put(null as any, null, { opt: { cert } } as any)
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
