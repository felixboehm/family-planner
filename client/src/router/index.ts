import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '@/views/CalendarView.vue'
import ChildcareView from '@/views/ChildcareView.vue'
import FairnessView from '@/views/FairnessView.vue'
import RequestsView from '@/views/RequestsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import AssistantView from '@/views/AssistantView.vue'
import FinanceView from '@/views/FinanceView.vue'
import LoginView from '@/views/LoginView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import { useAuth } from '@/composables/useAuth'
import { useFamily } from '@/composables/useFamily'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
    },
    {
      path: '/',
      name: 'calendar',
      component: CalendarView,
    },
    {
      path: '/childcare',
      name: 'childcare',
      component: ChildcareView,
    },
    {
      path: '/fairness',
      name: 'fairness',
      component: FairnessView,
    },
    {
      path: '/requests',
      name: 'requests',
      component: RequestsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
    },
    {
      path: '/assistant',
      name: 'assistant',
      component: AssistantView,
    },
    {
      path: '/finance',
      name: 'finance',
      component: FinanceView,
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { familyId } = useFamily()

  // While auth is still loading, allow navigation
  if (isLoading.value) {
    next()
    return
  }

  // Not authenticated -> redirect to login (unless already going there)
  if (!isAuthenticated.value) {
    if (to.meta.public) {
      next()
    } else {
      next({ name: 'login' })
    }
    return
  }

  // Authenticated but no family -> redirect to onboarding
  if (!familyId.value && to.name !== 'onboarding') {
    next({ name: 'onboarding' })
    return
  }

  // Authenticated with family trying to go to login -> redirect home
  if (to.name === 'login') {
    next({ name: 'calendar' })
    return
  }

  next()
})

export default router
