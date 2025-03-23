import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/DashboardView.vue'
import ServerManagement from '../views/ServerManagementView.vue'
import ServerMonitoring from '../views/ServerMonitoringView.vue'
import TestCaseManagement from '../views/TestCaseManagementView.vue'
import Home from '../views/HomeView.vue'
import About from '../views/AboutView.vue'
import MonitoringDashboard from '../views/MonitoringDashboard.vue'
import ServerMaintenance from '../views/ServerMaintenanceView.vue'
import JobManagement from '../views/JobManagementView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/servers',
    name: 'ServerManagement',
    component: ServerManagement
  },
  {
    path: '/servers/:id',
    name: 'ServerMonitoring',
    component: ServerMonitoring,
    props: true
  },
  {
    path: '/testcases',
    name: 'TestCaseManagement',
    component: TestCaseManagement
  },
  {
    path: '/maintenance',
    name: 'ServerMaintenance',
    component: ServerMaintenance
  },
  {
    path: '/monitoring',
    name: 'Monitoring',
    component: MonitoringDashboard
  },
  {
    path: '/jobs',
    name: 'JobManagement',
    component: JobManagement
  },
  {
    path: '/login',
    name: 'Home',
    component: Home
  },
  // 404 路由应该放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 