<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  selectedServerId: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['server-change']);

import type { Server } from '@/types/server';

const servers = ref<Server[]>([
  { id: '1', name: '应用服务器 #1', ip: '192.168.1.101', type: '应用服务器', status: 'online', lastUpdated: '2025-03-22 05:30:21' },
  { id: '2', name: '数据库服务器 #1', ip: '192.168.1.102', type: '数据库服务器', status: 'online', lastUpdated: '2025-03-22 05:30:10' },
  { id: '3', name: '应用服务器 #2', ip: '192.168.1.103', type: '应用服务器', status: 'warning', lastUpdated: '2025-03-22 05:28:45' },
  { id: '4', name: '缓存服务器 #1', ip: '192.168.1.104', type: '缓存服务器', status: 'online', lastUpdated: '2025-03-22 05:29:32' },
  { id: '5', name: '应用服务器 #3', ip: '192.168.1.105', type: '应用服务器', status: 'online', lastUpdated: '2025-03-22 05:15:10' },
  { id: '10', name: '负载均衡器 #1', ip: '192.168.1.106', type: '负载均衡器', status: 'online', lastUpdated: '2025-03-22 04:30:15' },
  { id: '11', name: '数据库服务器 #2', ip: '192.168.1.107', type: '数据库服务器', status: 'warning', lastUpdated: '2025-03-22 04:22:38' },
  { id: '12', name: '负载均衡器 #2', ip: '192.168.1.108', type: '负载均衡器', status: 'online', lastUpdated: '2025-03-22 04:15:20' }
]);

const selectedServer = ref(props.selectedServerId);

const handleServerChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (!target) return;
  selectedServer.value = target.value;
  emit('server-change', selectedServer.value);
};

onMounted(() => {
  selectedServer.value = props.selectedServerId;
});
</script>

<template>
  <div class="flex items-center">
    <label for="serverSelector" class="mr-2 text-sm font-medium text-gray-700">服务器:</label>
    <select 
      id="serverSelector" 
      v-model="selectedServer"
      @change="handleServerChange"
      class="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
    >
      <option value="all">所有服务器</option>
      <option v-for="server in servers" :key="server.id" :value="server.id">
        {{ server.name }}
      </option>
    </select>
  </div>
</template>