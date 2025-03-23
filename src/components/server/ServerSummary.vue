<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 模拟服务器统计数据
const serverStats = ref({
  total: 0,
  online: 0,
  warning: 0,
  offline: 0
});

// 模拟加载数据
onMounted(() => {
  // 模拟API请求延迟
  setTimeout(() => {
    serverStats.value = {
      total: 18,
      online: 14,
      warning: 3,
      offline: 1
    };
  }, 800);
});
</script>

<template>
  <div class="server-summary">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-lg bg-blue-50 border border-blue-100">
        <div class="font-semibold text-sm text-blue-800">总服务器</div>
        <div class="mt-1 text-2xl font-bold text-blue-700">{{ serverStats.total }}</div>
      </div>
      
      <div class="p-4 rounded-lg bg-green-50 border border-green-100">
        <div class="font-semibold text-sm text-green-800">正常运行</div>
        <div class="mt-1 text-2xl font-bold text-green-700">{{ serverStats.online }}</div>
      </div>
      
      <div class="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
        <div class="font-semibold text-sm text-yellow-800">告警状态</div>
        <div class="mt-1 text-2xl font-bold text-yellow-700">{{ serverStats.warning }}</div>
      </div>
      
      <div class="p-4 rounded-lg bg-red-50 border border-red-100">
        <div class="font-semibold text-sm text-red-800">离线</div>
        <div class="mt-1 text-2xl font-bold text-red-700">{{ serverStats.offline }}</div>
      </div>
    </div>
    
    <div class="mt-6">
      <div class="text-sm font-medium text-gray-700 mb-2">服务器状态分布</div>
      <div class="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div class="flex h-full">
          <div 
            class="bg-green-500" 
            :style="{width: `${(serverStats.online / serverStats.total) * 100}%`}" 
            title="在线"
          ></div>
          <div 
            class="bg-yellow-500" 
            :style="{width: `${(serverStats.warning / serverStats.total) * 100}%`}" 
            title="警告"
          ></div>
          <div 
            class="bg-red-500" 
            :style="{width: `${(serverStats.offline / serverStats.total) * 100}%`}" 
            title="离线"
          ></div>
        </div>
      </div>
      <div class="mt-2 flex justify-between text-xs text-gray-500">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>在线: {{ (serverStats.online / serverStats.total * 100).toFixed(1) }}%</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span>警告: {{ (serverStats.warning / serverStats.total * 100).toFixed(1) }}%</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>离线: {{ (serverStats.offline / serverStats.total * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template> 