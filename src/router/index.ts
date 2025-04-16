import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory('./'),
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
    },
    {
      path: '/workbench',
      name: 'workbench',
      component: () => import('@/views/WorkbenchView.vue')
    },
    {
      path: '/text-description',
      component: () => import('@/views/TextDescriptionView.vue')
    }
  ]
})

export default router
