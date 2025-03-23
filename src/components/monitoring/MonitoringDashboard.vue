<script setup lang="ts">
import { ref, computed } from 'vue';
import CpuUsageChart from './CpuUsageChart.vue';
import MemoryUsageChart from './MemoryUsageChart.vue';
import DiskUsageChart from './DiskUsageChart.vue';
import NetworkTrafficChart from './NetworkTrafficChart.vue';
import ServerSelector from '../server/ServerSelector.vue';

const serverId = ref('all');
const timeRange = ref('24h');

const timeRangeOptions = [
  { value: '6h', label: '最近6小时' },
  { value: '24h', label: '最近24小时' },
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' }
];

const handleServerChange = (id) => {
  serverId.value = id;
};

const handleTimeRangeChange = (e) => {
  timeRange.value = e.target.value;
};

const timeRangeText = computed(() => {
  return timeRangeOptions.find(option => option.value === timeRange.value)?.label || '最近24小时';
});
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">服务器性能监控</h1>
      
      <div class="flex items-center space-x-4">
        <ServerSelector 
          :selected-server-id="serverId" 
          @server-change="handleServerChange" 
        />
        
        <div class="flex items-center">
          <label for="timeRange" class="mr-2 text-sm font-medium text-gray-700">时间范围:</label>
          <select 
            id="timeRange" 
            v-model="timeRange"
            @change="handleTimeRangeChange"
            class="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
          >
            <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- CPU 使用率图表 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">CPU使用率</h2>
        <p class="text-sm text-gray-500 mb-4">
          {{ serverId === 'all' ? '所有服务器' : `服务器 #${serverId}` }} - {{ timeRangeText }}
        </p>
        <CpuUsageChart :server-id="serverId" :time-range="timeRange" />
      </div>
      
      <!-- 内存使用率图表 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">内存使用率</h2>
        <p class="text-sm text-gray-500 mb-4">
          {{ serverId === 'all' ? '所有服务器' : `服务器 #${serverId}` }} - {{ timeRangeText }}
        </p>
        <MemoryUsageChart :server-id="serverId" :time-range="timeRange" />
      </div>
      
      <!-- 磁盘使用率图表 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">磁盘使用率</h2>
        <p class="text-sm text-gray-500 mb-4">
          {{ serverId === 'all' ? '所有服务器' : `服务器 #${serverId}` }} - {{ timeRangeText }}
        </p>
        <DiskUsageChart :server-id="serverId" :time-range="timeRange" />
      </div>
      
      <!-- 网络流量图表 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">网络流量</h2>
        <p class="text-sm text-gray-500 mb-4">
          {{ serverId === 'all' ? '所有服务器' : `服务器 #${serverId}` }} - {{ timeRangeText }}
        </p>
        <NetworkTrafficChart :server-id="serverId" :time-range="timeRange" />
      </div>
    </div>
  </div>
</template> 