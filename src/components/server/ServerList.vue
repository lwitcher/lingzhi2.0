<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  selectedId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['server-selected']);

// 模拟服务器列表数据
const servers = ref([]);
const loading = ref(true);
const searchQuery = ref('');

// 计算筛选后的服务器列表
const filteredServers = () => {
  if (!searchQuery.value) return servers.value;
  
  const query = searchQuery.value.toLowerCase();
  return servers.value.filter(server => 
    server.name.toLowerCase().includes(query) || 
    server.ip.toLowerCase().includes(query) ||
    server.type.toLowerCase().includes(query)
  );
};

// 获取状态类名
const getStatusClass = (status) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'offline':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'online':
      return '在线';
    case 'warning':
      return '告警';
    case 'offline':
      return '离线';
    default:
      return '未知';
  }
};

// 模拟加载服务器列表数据
onMounted(() => {
  // 模拟API请求延迟
  setTimeout(() => {
    servers.value = [
      { id: '1', name: '生产服务器-01', ip: '192.168.1.101', type: '应用服务器', status: 'online', lastUpdated: '2025-03-22 05:30:21' },
      { id: '2', name: '数据库服务器-01', ip: '192.168.1.102', type: '数据库服务器', status: 'online', lastUpdated: '2025-03-22 05:30:10' },
      { id: '3', name: '生产服务器-02', ip: '192.168.1.103', type: '应用服务器', status: 'warning', lastUpdated: '2025-03-22 05:28:45' },
      { id: '4', name: '缓存服务器-01', ip: '192.168.1.104', type: '缓存服务器', status: 'online', lastUpdated: '2025-03-22 05:29:32' },
      { id: '5', name: '测试服务器-01', ip: '192.168.1.201', type: '测试服务器', status: 'online', lastUpdated: '2025-03-22 05:15:10' },
      { id: '6', name: '备份服务器-01', ip: '192.168.1.105', type: '备份服务器', status: 'online', lastUpdated: '2025-03-22 05:10:22' },
      { id: '7', name: '日志服务器-01', ip: '192.168.1.106', type: '日志服务器', status: 'online', lastUpdated: '2025-03-22 05:05:43' },
      { id: '8', name: '测试服务器-02', ip: '192.168.1.202', type: '测试服务器', status: 'warning', lastUpdated: '2025-03-22 04:58:11' },
      { id: '9', name: '开发服务器-01', ip: '192.168.1.203', type: '开发服务器', status: 'online', lastUpdated: '2025-03-22 04:45:30' },
      { id: '10', name: '负载均衡-01', ip: '192.168.1.107', type: '负载均衡器', status: 'online', lastUpdated: '2025-03-22 04:30:15' },
      { id: '11', name: '数据库服务器-02', ip: '192.168.1.108', type: '数据库服务器', status: 'warning', lastUpdated: '2025-03-22 04:22:38' },
      { id: '12', name: '负载均衡-02', ip: '192.168.1.109', type: '负载均衡器', status: 'online', lastUpdated: '2025-03-22 04:15:20' },
      { id: '13', name: '开发服务器-02', ip: '192.168.1.204', type: '开发服务器', status: 'offline', lastUpdated: '2025-03-22 03:45:10' },
      { id: '14', name: '日志服务器-02', ip: '192.168.1.110', type: '日志服务器', status: 'online', lastUpdated: '2025-03-22 03:30:45' }
    ];
    loading.value = false;
    
    // 如果有选中的服务器ID，则自动选中
    if (props.selectedId) {
      const selectedServer = servers.value.find(s => s.id === props.selectedId);
      if (selectedServer) {
        emit('server-selected', selectedServer);
      }
    }
  }, 800);
});

// 处理服务器选择
const handleServerSelect = (server) => {
  emit('server-selected', server);
};
</script>

<template>
  <div class="server-list">
    <!-- 搜索框 -->
    <div class="mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="搜索服务器..."
        />
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="py-4 text-center text-gray-500">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <div>加载中...</div>
    </div>
    
    <!-- 服务器列表 -->
    <div v-else-if="filteredServers().length > 0" class="overflow-hidden rounded-md">
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="server in filteredServers()"
          :key="server.id"
          :class="[
            'cursor-pointer hover:bg-gray-50',
            server.id === selectedId ? 'bg-blue-50' : ''
          ]"
          @click="handleServerSelect(server)"
        >
          <div class="p-4">
            <div class="flex justify-between">
              <div class="font-medium text-gray-900">{{ server.name }}</div>
              <span 
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusClass(server.status)
                ]"
              >
                {{ getStatusText(server.status) }}
              </span>
            </div>
            <div class="mt-1 text-sm text-gray-500">
              <div>IP: {{ server.ip }}</div>
              <div>类型: {{ server.type }}</div>
              <div class="text-xs mt-1">更新时间: {{ server.lastUpdated }}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- 空结果 -->
    <div v-else class="py-4 text-center text-gray-500">
      <div>没有找到匹配的服务器</div>
    </div>
  </div>
</template> 