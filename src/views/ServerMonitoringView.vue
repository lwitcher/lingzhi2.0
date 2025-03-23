<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CpuUsageChart from '@/components/monitoring/CpuUsageChart.vue';
import MemoryUsageChart from '@/components/monitoring/MemoryUsageChart.vue';
import DiskUsageChart from '@/components/monitoring/DiskUsageChart.vue';
import NetworkTrafficChart from '@/components/monitoring/NetworkTrafficChart.vue';
import ServerSelector from '@/components/server/ServerSelector.vue';

const selectedServerId = ref('all');
const loading = ref(true);
const timeRange = ref('24h');

const timeRangeOptions = [
  { label: '最近6小时', value: '6h' },
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' }
];

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

const handleServerChange = (serverId) => {
  selectedServerId.value = serverId;
  loading.value = true;
  
  // 模拟数据重新加载
  setTimeout(() => {
    loading.value = false;
  }, 600);
};

const handleTimeRangeChange = (range) => {
  timeRange.value = range;
  loading.value = true;
  
  // 模拟数据重新加载
  setTimeout(() => {
    loading.value = false;
  }, 600);
};
</script>

<template>
  <div class="server-monitoring-container">
    <h1 class="text-2xl font-bold mb-6">服务器状态监控</h1>
    
    <div class="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
      <div class="flex items-center">
        <span class="mr-2">选择服务器:</span>
        <ServerSelector :selected-id="selectedServerId" @change="handleServerChange" />
      </div>
      
      <div class="flex items-center">
        <span class="mr-2">时间范围:</span>
        <select 
          v-model="timeRange" 
          class="bg-white border border-gray-300 rounded-md px-3 py-1.5"
          @change="handleTimeRangeChange($event.target.value)"
        >
          <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">CPU使用率</h2>
        <CpuUsageChart :server-id="selectedServerId" :time-range="timeRange" />
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">内存使用率</h2>
        <MemoryUsageChart :server-id="selectedServerId" :time-range="timeRange" />
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">磁盘使用率</h2>
        <DiskUsageChart :server-id="selectedServerId" :time-range="timeRange" />
      </div>
      
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">网络流量</h2>
        <NetworkTrafficChart :server-id="selectedServerId" :time-range="timeRange" />
      </div>
    </div>
  </div>
</template> 