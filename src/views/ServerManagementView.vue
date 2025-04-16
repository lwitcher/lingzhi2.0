<script setup lang="ts">
import { ref } from 'vue';
import ServerList from '@/components/server/ServerList.vue';
import ServerDetails from '@/components/server/ServerDetails.vue';
import type { Server } from '@/components/server/ServerDetails.vue';

const selectedServer = ref<Server | null>(null);

const handleServerSelect = (server: Server) => {
  selectedServer.value = server;
};
</script>

<template>
  <div class="server-management-container">
    <h1 class="text-2xl font-bold mb-6">服务器管理</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 card">
        <h2 class="text-lg font-semibold mb-4">服务器列表</h2>
        <ServerList @server-selected="handleServerSelect" :selected-id="selectedServer?.id" />
      </div>
      
      <div class="lg:col-span-2 card">
        <h2 class="text-lg font-semibold mb-4">服务器详情</h2>
        <ServerDetails v-if="selectedServer" :server="selectedServer" />
        <div v-else class="text-center py-12 text-gray-500">
          请从左侧列表选择一个服务器查看详情
        </div>
      </div>
    </div>
  </div>
</template>