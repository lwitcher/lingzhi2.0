<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ServerStatusChart from '@/components/server/ServerStatusChart.vue';
import ServerSummary from '@/components/server/ServerSummary.vue';
import CaseExecutionOverview from '@/components/dashboard/CaseExecutionOverview.vue';
import RecentTasks from '@/components/dashboard/RecentTasks.vue';

const loading = ref(true);

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<template>
  <div class="dashboard-container">
    <h1 class="text-2xl font-bold mb-6">系统仪表盘</h1>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">服务器状态概览</h2>
          <ServerSummary />
        </div>
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">用例执行结果通知</h2>
          <CaseExecutionOverview />
        </div>
      </div>
      
      <div class="card mb-8">
        <h2 class="text-lg font-semibold mb-4">用例通过情况</h2>
        <ServerStatusChart />
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">最近任务状态</h2>
        <RecentTasks />
      </div>
    </div>
  </div>
</template> 