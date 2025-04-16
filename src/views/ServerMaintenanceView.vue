<script setup lang="ts">
import { ref } from 'vue';

// 简单的维护视图组件
const maintenanceTasks = ref([
  { id: 1, name: '系统更新', status: '待执行', scheduledTime: '2023-12-15 03:00' },
  { id: 2, name: '数据库备份', status: '已完成', scheduledTime: '2023-12-10 01:00' },
  { id: 3, name: '安全补丁安装', status: '进行中', scheduledTime: '2023-12-12 02:30' }
]);
</script>

<template>
  <div class="server-maintenance-container">
    <h1 class="text-2xl font-bold mb-6">服务器维护</h1>
    
    <div class="card">
      <h2 class="text-lg font-semibold mb-4">维护任务列表</h2>
      
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 text-left">ID</th>
            <th class="py-2 px-4 text-left">任务名称</th>
            <th class="py-2 px-4 text-left">状态</th>
            <th class="py-2 px-4 text-left">计划时间</th>
            <th class="py-2 px-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in maintenanceTasks" :key="task.id" class="border-b">
            <td class="py-2 px-4">{{ task.id }}</td>
            <td class="py-2 px-4">{{ task.name }}</td>
            <td class="py-2 px-4">
              <span 
                :class="{
                  'bg-yellow-100 text-yellow-800': task.status === '待执行',
                  'bg-green-100 text-green-800': task.status === '已完成',
                  'bg-blue-100 text-blue-800': task.status === '进行中'
                }"
                class="px-2 py-1 rounded-full text-xs"
              >
                {{ task.status }}
              </span>
            </td>
            <td class="py-2 px-4">{{ task.scheduledTime }}</td>
            <td class="py-2 px-4">
              <button class="text-blue-500 hover:text-blue-700 mr-2">详情</button>
              <button class="text-green-500 hover:text-green-700">执行</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.server-maintenance-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}
</style>