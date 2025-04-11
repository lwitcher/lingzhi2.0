<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
});

const serverInfo = ref(null);
const loading = ref(true);
const cpuChartContainer = ref(null);
const memoryChartContainer = ref(null);
const diskChartContainer = ref(null);
let cpuChart = null;
let memoryChart = null;
let diskChart = null;

// 计算服务器状态颜色
const statusColor = computed(() => {
  switch (props.server.status) {
    case 'online':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'offline':
      return 'red';
    default:
      return 'gray';
  }
});

// 计算状态文本
const statusText = computed(() => {
  switch (props.server.status) {
    case 'online':
      return '在线';
    case 'warning':
      return '告警';
    case 'offline':
      return '离线';
    default:
      return '未知';
  }
});

// 模拟加载服务器详情数据
onMounted(() => {
  // 模拟API请求延迟
  setTimeout(() => {
    // 生成随机值，但基于服务器ID保持一致性
    const serverId = parseInt(props.server.id);
    const cpuUsage = 30 + (serverId % 5) * 10 + Math.round(Math.random() * 10);
    const memoryUsage = 40 + (serverId % 4) * 10 + Math.round(Math.random() * 15);
    const diskUsage = 50 + (serverId % 3) * 10 + Math.round(Math.random() * 10);
    
    serverInfo.value = {
      os: 'CentOS 8.4',
      cpu: {
        model: 'Intel Xeon E5-2680 v4',
        cores: 12,
        usage: cpuUsage,
        temperature: 45 + Math.round(Math.random() * 10)
      },
      memory: {
        total: '64GB',
        usage: memoryUsage,
        available: '24.5GB'
      },
      disk: {
        total: '2TB',
        usage: diskUsage,
        available: '850GB'
      },
      network: {
        interface: 'eth0',
        ipAddress: props.server.ip,
        macAddress: '00:1B:44:11:3A:' + props.server.id.padStart(2, '0'),
        uploadSpeed: '10.5 MB/s',
        downloadSpeed: '25.2 MB/s'
      },
      services: [
        { name: 'nginx', status: 'running', uptime: '45 days 12:30:45' },
        { name: 'mysql', status: 'running', uptime: '45 days 11:52:30' },
        { name: 'redis', status: 'running', uptime: '12 days 05:15:20' },
        { name: 'elasticsearch', status: props.server.status === 'warning' ? 'warning' : 'running', uptime: '10 days 08:45:33' }
      ],
      uptime: '45 days 12:30:45',
      lastReboot: '2025-02-05 08:30:22'
    };
    
    loading.value = false;
    
    // 使用nextTick确保DOM更新完成
    nextTick(() => {
      initCharts();
    });
  }, 800);
});

// 初始化图表
const initCharts = () => {
  if (!serverInfo.value) return;

  // CPU使用率图表
  if (cpuChartContainer.value) {
    cpuChart = echarts.init(cpuChartContainer.value);
    const cpuOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: getCpuColor(serverInfo.value.cpu.usage)
            }
          },
          axisLine: {
            lineStyle: {
              width: 8 // 将线宽从18改为8
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 18,
            offsetCenter: [0, 0]
          },
          data: [
            {
              value: serverInfo.value.cpu.usage
            }
          ]
        }
      ]
    };
    cpuChart.setOption(cpuOption);
  }
  
  // 内存使用率图表
  if (memoryChartContainer.value) {
    memoryChart = echarts.init(memoryChartContainer.value);
    const memoryOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: getMemoryColor(serverInfo.value.memory.usage)
            }
          },
          axisLine: {
            lineStyle: {
              width: 8 // 将线宽从18改为8
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 18,
            offsetCenter: [0, 0]
          },
          data: [
            {
              value: serverInfo.value.memory.usage
            }
          ]
        }
      ]
    };
    memoryChart.setOption(memoryOption);
  }
  
  // 磁盘使用率图表
  if (diskChartContainer.value) {
    diskChart = echarts.init(diskChartContainer.value);
    const diskOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: getDiskColor(serverInfo.value.disk.usage)
            }
          },
          axisLine: {
            lineStyle: {
              width: 8 // 将线宽从18改为8
            }
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 18,
            offsetCenter: [0, 0]
          },
          data: [
            {
              value: serverInfo.value.disk.usage
            }
          ]
        }
      ]
    };
    diskChart.setOption(diskOption);
  }
};

// 获取CPU颜色
const getCpuColor = (usage) => {
  if (usage < 50) return '#10B981';
  if (usage < 80) return '#F59E0B';
  return '#EF4444';
};

// 获取内存颜色
const getMemoryColor = (usage) => {
  if (usage < 60) return '#10B981';
  if (usage < 85) return '#F59E0B';
  return '#EF4444';
};

// 获取磁盘颜色
const getDiskColor = (usage) => {
  if (usage < 70) return '#10B981';
  if (usage < 90) return '#F59E0B';
  return '#EF4444';
};

// 获取服务状态标签样式
const getServiceStatusClass = (status) => {
  switch (status) {
    case 'running':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'stopped':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div class="server-details">
    <!-- 加载状态 -->
    <div v-if="loading" class="py-4 text-center text-gray-500">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <div>加载服务器详情中...</div>
    </div>
    
    <!-- 服务器详情 -->
    <div v-else-if="serverInfo">
      <!-- 服务器基本信息 -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ server.name }}</h3>
          <div class="text-sm text-gray-500">
            <div>{{ server.ip }} | {{ serverInfo.os }}</div>
            <div>类型: {{ server.type }}</div>
          </div>
        </div>
        <div>
          <span 
            :class="[
              'px-3 py-1 text-sm font-medium rounded-full',
              `bg-${statusColor}-100 text-${statusColor}-800`
            ]"
          >
            {{ statusText }}
          </span>
        </div>
      </div>
      
      <!-- 资源使用情况 -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-4">资源使用情况</h4>
        
        <div class="grid grid-cols-3 gap-4">
          <!-- CPU -->
          <div class="flex flex-col items-center">
            <div class="text-sm font-medium text-gray-700">CPU</div>
            <div ref="cpuChartContainer" class="w-24 h-24" style="width: 96px; height: 96px;"></div>
            <div class="mt-1 text-sm">
              <span class="font-medium">{{ serverInfo.cpu.usage }}%</span>
              <span class="text-xs text-gray-500 ml-1">{{ serverInfo.cpu.temperature }}°C</span>
            </div>
          </div>
          
          <!-- 内存 -->
          <div class="flex flex-col items-center">
            <div class="text-sm font-medium text-gray-700">内存</div>
            <div ref="memoryChartContainer" class="w-24 h-24" style="width: 96px; height: 96px;"></div>
            <div class="mt-1 text-sm">
              <span class="font-medium">{{ serverInfo.memory.usage }}%</span>
              <span class="text-xs text-gray-500 ml-1">可用: {{ serverInfo.memory.available }}</span>
            </div>
          </div>
          
          <!-- 磁盘 -->
          <div class="flex flex-col items-center">
            <div class="text-sm font-medium text-gray-700">磁盘</div>
            <div ref="diskChartContainer" class="w-24 h-24" style="width: 96px; height: 96px;"></div>
            <div class="mt-1 text-sm">
              <span class="font-medium">{{ serverInfo.disk.usage }}%</span>
              <span class="text-xs text-gray-500 ml-1">可用: {{ serverInfo.disk.available }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 网络信息 -->
      <div class="rounded-lg border border-gray-200 p-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">网络信息</h4>
        
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">接口:</span>
            <span class="ml-1">{{ serverInfo.network.interface }}</span>
          </div>
          <div>
            <span class="text-gray-500">MAC地址:</span>
            <span class="ml-1">{{ serverInfo.network.macAddress }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-500">IP地址:</span>
            <span class="ml-1">{{ serverInfo.network.ipAddress }}</span>
          </div>
          <div>
            <span class="text-gray-500">上传速度:</span>
            <span class="ml-1">{{ serverInfo.network.uploadSpeed }}</span>
          </div>
          <div>
            <span class="text-gray-500">下载速度:</span>
            <span class="ml-1">{{ serverInfo.network.downloadSpeed }}</span>
          </div>
        </div>
      </div>
      
      <!-- 运行中的服务 -->
      <div class="rounded-lg border border-gray-200 p-4 mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">运行中的服务</h4>
        
        <div class="overflow-hidden rounded-md border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务名称</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">运行时间</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="service in serverInfo.services" :key="service.name">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{{ service.name }}</td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getServiceStatusClass(service.status)
                  ]">
                    {{ service.status }}
                  </span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ service.uptime }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 系统信息 -->
      <div class="rounded-lg border border-gray-200 p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">系统信息</h4>
        
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">操作系统:</span>
            <span class="ml-1">{{ serverInfo.os }}</span>
          </div>
          <div>
            <span class="text-gray-500">处理器:</span>
            <span class="ml-1">{{ serverInfo.cpu.model }}</span>
          </div>
          <div>
            <span class="text-gray-500">CPU核心数:</span>
            <span class="ml-1">{{ serverInfo.cpu.cores }}</span>
          </div>
          <div>
            <span class="text-gray-500">内存总量:</span>
            <span class="ml-1">{{ serverInfo.memory.total }}</span>
          </div>
          <div>
            <span class="text-gray-500">磁盘总量:</span>
            <span class="ml-1">{{ serverInfo.disk.total }}</span>
          </div>
          <div>
            <span class="text-gray-500">运行时间:</span>
            <span class="ml-1">{{ serverInfo.uptime }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-500">上次重启:</span>
            <span class="ml-1">{{ serverInfo.lastReboot }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>