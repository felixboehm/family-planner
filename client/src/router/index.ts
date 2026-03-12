import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '@/views/CalendarView.vue'
import ChildcareView from '@/views/ChildcareView.vue'
import FairnessView from '@/views/FairnessView.vue'
import RequestsView from '@/views/RequestsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import AssistantView from '@/views/AssistantView.vue'
import FinanceView from '@/views/FinanceView.vue'
import SubscriptionView from '@/views/SubscriptionView.vue'
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
    {
      path: '/subscription',
      name: 'subscription',
      component: SubscriptionView,
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { familyId } = useFamily()

  if (isLoading.value) {
    next()
    return
  }

  if (!isAuthenticated.value) {
    if (to.meta.public) {
      next()
    } else {
      next({ name: 'login' })
    }
    return
  }

  // Don't block navigation to onboarding, but don't force it here either.
  // The App.vue watcher handles the delayed redirect after familyId has time to load.

  if (to.name === 'login') {
    next({ name: 'calendar' })
    return
  }

  next()
})

export default router
