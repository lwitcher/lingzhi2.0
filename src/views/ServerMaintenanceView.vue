<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MaintenanceTaskList from '@/components/maintenance/MaintenanceTaskList.vue';
import MaintenanceTaskForm from '@/components/maintenance/MaintenanceTaskForm.vue';
import MaintenanceHistory from '@/components/maintenance/MaintenanceHistory.vue';

const activeTab = ref('current');
const showNewTaskForm = ref(false);
const loading = ref(true);

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

const handleTabChange = (tab) => {
  activeTab.value = tab;
  if (tab === 'new') {
    showNewTaskForm.value = true;
  } else {
    showNewTaskForm.value = false;
  }
};

const handleTaskCreated = () => {
  showNewTaskForm.value = false;
  activeTab.value = 'current';
  
  // 模拟刷新数据
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const handleTaskCancel = () => {
  showNewTaskForm.value = false;
  activeTab.value = 'current';
};
</script>

<template>
  <div class="server-maintenance-container">
    <h1 class="text-2xl font-bold mb-6">服务器维护</h1>
    
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button 
          @click="handleTabChange('current')" 
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'current' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          当前维护任务
        </button>
        <button 
          @click="handleTabChange('history')" 
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'history' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          历史维护记录
        </button>
        <button 
          @click="handleTabChange('new')" 
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'new' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          创建维护任务
        </button>
      </nav>
    </div>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
    
    <div v-else-if="showNewTaskForm" class="card">
      <MaintenanceTaskForm 
        @task-created="handleTaskCreated"
        @cancel="handleTaskCancel"
      />
    </div>
    
    <div v-else-if="activeTab === 'current'" class="card">
      <MaintenanceTaskList />
    </div>
    
    <div v-else-if="activeTab === 'history'" class="card">
      <MaintenanceHistory />
    </div>
  </div>
</template> 