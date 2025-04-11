<script setup lang="ts">
// 修改组件名
const componentName = 'CaseExecutionOverview';
import { ref, onMounted } from 'vue';

// 模拟任务数据
const alerts = ref([]);
const loading = ref(true);

// 获取任务结果样式
const getAlertLevelClass = (level) => {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 获取任务结果级别文本
const getAlertLevelText = (level) => {
  switch (level) {
    case 'critical':
      return '未通过';
    case 'warning':
      return '存在警告';
    case 'info':
      return '通过';
    default:
      return '未知';
  }
};

// 模拟加载任务数据
onMounted(() => {
  // 模拟API请求延迟
  setTimeout(() => {
    alerts.value = [
      { 
        id: 1, 
        level: 'critical', 
        message: '客户限仓用例01', 
        server: '张三服务器-01', 
        timestamp: '2025-03-22 05:28:45',
        acknowledged: false
      },
      { 
        id: 2, 
        level: 'warning', 
        message: '实控组限仓用例03', 
        server: '张三服务器-01', 
        timestamp: '2025-03-22 04:22:38',
        acknowledged: false
      },
      { 
        id: 3, 
        level: 'warning', 
        message: '实控组限仓用例04', 
        server: '张三服务器-01', 
        timestamp: '2025-03-22 04:58:11',
        acknowledged: true
      },
      { 
        id: 4, 
        level: 'info', 
        message: '客户限仓用例02', 
        server: '张三服务器-02', 
        timestamp: '2025-03-22 04:30:15',
        acknowledged: true
      },
    ];
    loading.value = false;
  }, 800);
});

// 确认任务
const acknowledgeAlert = (alertId) => {
  const alert = alerts.value.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
  }
};
</script>

<template>
  <div class="task-execution-overview">
    <!-- 修改类名和内容 -->
    <div v-if="loading" class="py-4 text-center text-gray-500">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <div>加载任务执行结果中...</div>
    </div>
    
    <!-- 任务列表 -->
    <div v-else-if="alerts.length > 0">
      <ul class="divide-y divide-gray-200">
        <li v-for="alert in alerts" :key="alert.id" class="py-3">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2',
                    getAlertLevelClass(alert.level)
                  ]"
                >
                  {{ getAlertLevelText(alert.level) }}
                </span>
                <span class="text-sm font-medium text-gray-900">{{ alert.message }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-500">
                <span>服务器: {{ alert.server }}</span>
                <span class="mx-1">•</span>
                <span>{{ alert.timestamp }}</span>
              </div>
            </div>
            <button 
              v-if="!alert.acknowledged"
              @click="acknowledgeAlert(alert.id)"
              class="ml-3 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              确认
            </button>
            <span 
              v-else
              class="ml-3 text-xs font-medium text-gray-500"
            >
              已确认
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- 无任务状态 -->
    <div v-else class="py-8 text-center text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="mt-2 text-sm font-medium">当前没有任务结果</div>
    </div>
  </div>
</template>

<style scoped>
.task-execution-overview {
  /* 修改样式类名 */
}
</style>