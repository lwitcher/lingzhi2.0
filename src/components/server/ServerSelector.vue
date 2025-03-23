<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  selectedServerId: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['server-change']);

const servers = ref([
  { id: '1', name: '应用服务器 #1' },
  { id: '2', name: '数据库服务器 #1' },
  { id: '3', name: '应用服务器 #2' },
  { id: '4', name: '缓存服务器 #1' },
  { id: '5', name: '应用服务器 #3' },
  { id: '10', name: '负载均衡器 #1' },
  { id: '11', name: '数据库服务器 #2' },
  { id: '12', name: '负载均衡器 #2' }
]);

const selectedServer = ref(props.selectedServerId);

const handleServerChange = (e) => {
  selectedServer.value = e.target.value;
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