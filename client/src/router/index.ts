import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '@/views/CalendarView.vue'
import ChildcareView from '@/views/ChildcareView.vue'
import FairnessView from '@/views/FairnessView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router
