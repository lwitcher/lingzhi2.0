import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/DashboardView.vue'
import ServerManagement from '../views/ServerManagementView.vue'
import ServerMonitoring from '../views/ServerMonitoringView.vue'
import TestCaseManagement from '../views/TestCaseManagementView.vue'
import Home from '../views/HomeView.vue'
import About from '../views/AboutView.vue'
import MonitoringDashboard from '../views/MonitoringDashboard.vue'
import VisualEditor from '../views/VisualEditorView.vue'
import JobManagement from '../views/JobManagementView.vue'
import Workbench from '../views/WorkbenchView.vue'

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
    path: '/visual-editor',
    name: 'VisualEditor',
    component: VisualEditor
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
  },{
    path: '/workbench',
    name: 'workbench',
    component: Workbench
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/maintenance/MaintenanceView.vue'),
    meta: {
      title: '系统维护',
      requiresAuth: true // 需要登录才能访问
    }
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