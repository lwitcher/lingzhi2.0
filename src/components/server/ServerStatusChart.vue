<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  serverId: {
    type: String,
    default: 'all'
  },
  timeRange: {
    type: String,
    default: '24h'
  }
});

const chartContainer = ref(null);
let chart = null;

// 模拟数据生成函数
const generateMockData = () => {
  const now = new Date();
  const data = [];
  const categories = [];
  
  // 根据选择的时间范围生成不同数量的数据点
  let points = 24;
  let step = 60 * 60 * 1000; // 1小时
  
  switch (props.timeRange) {
    case '6h':
      points = 6;
      step = 60 * 60 * 1000; // 1小时
      break;
    case '24h':
      points = 24;
      step = 60 * 60 * 1000; // 1小时
      break;
    case '7d':
      points = 7;
      step = 24 * 60 * 60 * 1000; // 1天
      break;
    case '30d':
      points = 30;
      step = 24 * 60 * 60 * 1000; // 1天
      break;
  }
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * step);
    let timeStr;
    
    if (props.timeRange === '7d' || props.timeRange === '30d') {
      timeStr = `${time.getMonth() + 1}/${time.getDate()}`;
    } else {
      timeStr = `${time.getHours()}:00`;
    }
    
    categories.push(timeStr);
    
    // CPU使用率 - 随机生成但保持一定的趋势性
    const cpu = Math.round(30 + Math.random() * 40);
    
    // 内存使用率 - 随机生成但保持一定的趋势性
    const memory = Math.round(40 + Math.random() * 35);
    
    // 模拟特定服务器的不同使用模式
    let cpuValue = cpu;
    let memoryValue = memory;
    
    if (props.serverId !== 'all') {
      const serverId = parseInt(props.serverId);
      if (serverId % 3 === 0) {
        cpuValue = Math.min(95, cpu + 20); // 高CPU使用率
      } else if (serverId % 3 === 1) {
        memoryValue = Math.min(90, memory + 25); // 高内存使用率
      }
    }
    
    data.push({
      cpu: cpuValue,
      memory: memoryValue
    });
  }
  
  return { data, categories };
};

const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chart) return;
  
  const { data, categories } = generateMockData();
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['CPU使用率', '内存使用率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        data: data.map(item => item.cpu),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#3B82F6'
        },
        itemStyle: {
          color: '#3B82F6'
        }
      },
      {
        name: '内存使用率',
        type: 'line',
        data: data.map(item => item.memory),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#10B981'
        },
        itemStyle: {
          color: '#10B981'
        }
      }
    ]
  };
  
  chart.setOption(option);
};

const handleResize = () => {
  chart && chart.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', handleResize);
});

watch(
  () => [props.serverId, props.timeRange],
  () => {
    updateChart();
  }
);
</script>

<template>
  <div ref="chartContainer" class="w-full h-80"></div>
</template> 