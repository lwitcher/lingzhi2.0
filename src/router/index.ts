import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/server/management',
      name: 'server-management',
      component: () => import('../views/ServerManagementView.vue')
    },
    {
      path: '/server/monitoring',
      name: 'server-monitoring',
      component: () => import('../views/ServerMonitoringView.vue')
    },
    {
      path: '/server/maintenance',
      name: 'server-maintenance',
      component: () => import('../views/ServerMaintenanceView.vue')
    },
    {
      path: '/testcase',
      name: 'testcase-management',
      component: () => import('../views/TestCaseManagementView.vue')
    },
    {
      path: '/jobs',
      name: 'job-management',
      component: () => import('../views/JobManagementView.vue')
    }
  ]
})

export default router
