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
  const inboundData = [];
  const outboundData = [];
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
  
  // 基础值，可以根据serverId生成不同的数据模式
  let baseInbound = 20;
  let baseOutbound = 10;
  if (props.serverId !== 'all') {
    const id = parseInt(props.serverId);
    // 负载均衡器和数据库服务器的网络流量通常更高
    if (id === 10 || id === 12) { // 负载均衡
      baseInbound = 50;
      baseOutbound = 40;
    } else if (id === 2 || id === 11) { // 数据库服务器
      baseInbound = 35;
      baseOutbound = 25;
    } else {
      baseInbound = 20 + (id % 5) * 3;
      baseOutbound = 10 + (id % 5) * 2;
    }
  }
  
  // 生成时间序列数据
  let lastInbound = baseInbound + Math.random() * 10;
  let lastOutbound = baseOutbound + Math.random() * 5;
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * step);
    let timeStr;
    
    if (props.timeRange === '7d' || props.timeRange === '30d') {
      timeStr = `${time.getMonth() + 1}/${time.getDate()}`;
    } else {
      timeStr = `${time.getHours()}:00`;
    }
    
    categories.push(timeStr);
    
    // 模拟业务高峰期（工作时间）网络流量更高
    let timeBoost = 1;
    if (props.timeRange !== '7d' && props.timeRange !== '30d') {
      const hour = time.getHours();
      if (hour >= 9 && hour <= 18) {
        timeBoost = 1.5; // 工作时间流量更高
      } else if (hour >= 0 && hour <= 6) {
        timeBoost = 0.5; // 凌晨流量较低
      }
    }
    
    // 模拟波动
    const inChange = (Math.random() * 10 - 3) * timeBoost;
    const outChange = (Math.random() * 6 - 2) * timeBoost;
    
    lastInbound = Math.max(5, Math.min(100, lastInbound + inChange));
    lastOutbound = Math.max(2, Math.min(80, lastOutbound + outChange));
    
    inboundData.push(Math.round(lastInbound * 10) / 10);
    outboundData.push(Math.round(lastOutbound * 10) / 10);
  }
  
  return { inboundData, outboundData, categories };
};

const initChart = () => {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value);
    updateChart();
  }
};

const updateChart = () => {
  if (!chart.value) return;
  
  const { inboundData, outboundData, categories } = generateMockData();
  
  const option = {
    title: {
      text: '网络流量(MB/s)',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['入站流量', '出站流量'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} MB/s'
      }
    },
    series: [
      {
        name: '入站流量',
        type: 'line',
        data: inboundData,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(14, 165, 233)'
            },
            {
              offset: 1,
              color: 'rgb(224, 242, 254)'
            }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#0EA5E9'
        }
      },
      {
        name: '出站流量',
        type: 'line',
        data: outboundData,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(251, 113, 133)'
            },
            {
              offset: 1,
              color: 'rgb(255, 241, 242)'
            }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#FB7185'
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