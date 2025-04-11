<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 模拟任务数据
const tasks = ref([]);
const loading = ref(true);

// 获取任务状态样式
const getTaskStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'queued':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 获取任务状态文本
const getTaskStatusText = (status) => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'running':
      return '运行中';
    case 'failed':
      return '失败';
    case 'queued':
      return '队列中';
    default:
      return '未知';
  }
};

// 模拟加载任务数据
onMounted(() => {
  // 模拟API请求延迟
  setTimeout(() => {
    tasks.value = [
      { 
        id: 1, 
        name: '全量用例回归任务', 
        server: '李四服务器-01', 
        status: 'completed', 
        startTime: '2025-03-22 03:15:10',
        endTime: '2025-03-22 04:05:32'
      },
      { 
        id: 2, 
        name: '模糊测试任务', 
        server: '李四服务器-02', 
        status: 'completed', 
        startTime: '2025-03-22 04:00:00',
        endTime: '2025-03-22 04:15:23'
      },
      { 
        id: 3, 
        name: '撮合模块性能测试任务', 
        server: '李四服务器-03', 
        status: 'running', 
        startTime: '2025-03-22 05:30:00',
        endTime: null
      },
      { 
        id: 4, 
        name: '新一代交易系统对比测试', 
        server: '李四服务器-03', 
        status: 'queued', 
        startTime: null,
        endTime: null
      },
      { 
        id: 5, 
        name: '项目A持续集成任务', 
        server: '李四服务器-01', 
        status: 'failed', 
        startTime: '2025-03-22 04:25:12',
        endTime: '2025-03-22 04:25:45'
      },
    ];
    loading.value = false;
  }, 800);
});
</script>

<template>
  <div class="recent-tasks">
    <!-- 加载状态 -->
    <div v-if="loading" class="py-4 text-center text-gray-500">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <div>加载任务数据中...</div>
    </div>
    
    <!-- 任务列表 -->
    <div v-else-if="tasks.length > 0" class="overflow-hidden rounded-md border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务器</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="task in tasks" :key="task.id">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ task.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ task.server }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                getTaskStatusClass(task.status)
              ]">
                {{ getTaskStatusText(task.status) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              <div v-if="task.status === 'queued'">
                等待执行
              </div>
              <div v-else-if="task.status === 'running'">
                {{ task.startTime }} 开始
              </div>
              <div v-else>
                {{ task.endTime }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 无任务状态 -->
    <div v-else class="py-8 text-center text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <div class="mt-2 text-sm font-medium">暂无任务记录</div>
    </div>
  </div>
</template>