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

// 使用类型化声明
const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<echarts.ECharts | null>(null);

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
    
    const totalCases = Math.floor(Math.random() * 150 + 50); // 50-200之间的随机数
    let failedCases = Math.floor(Math.random() * totalCases * 0.3); // 失败数不超过30%
    
    // 根据服务器调整失败率
    if (props.serverId !== 'all') {
      const serverId = parseInt(props.serverId);
      if (serverId % 2 === 0) {
        failedCases = Math.floor(totalCases * 0.4 + Math.random() * 10); // 偶数服务器失败率40%+
      }
    }
    
    data.push({
      total: totalCases,
      failed: failedCases
    });
  }
  
  return { data, categories };
};

const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chart.value) return;
  
  const { data, categories } = generateMockData();
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['执行总数', '失败数']
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
      type: 'value'
    },
    series: [
      {
        name: '执行总数',
        type: 'bar',
        data: data.map(item => item.total),
        itemStyle: {
          color: '#3B82F6'
        },
        barGap: '0%',
        barCategoryGap: '20%'
      },
      {
        name: '失败数',
        type: 'bar',
        data: data.map(item => item.failed),
        itemStyle: {
          color: '#EF4444'
        }
      }
    ]
  };
  
  chart.value.setOption(option);
};

const handleResize = () => {
  chart.value && chart.value.resize();
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.dispose();
    chart.value = null;
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