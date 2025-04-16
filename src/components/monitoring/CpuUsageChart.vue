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
  
  // 基础值，可以根据serverId生成不同的数据模式
  let baseValue = 30;
  if (props.serverId !== 'all') {
    const id = parseInt(props.serverId);
    baseValue = 30 + (id % 5) * 5;
  }
  
  // 生成时间序列数据
  let lastValue = baseValue + Math.random() * 15;
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * step);
    let timeStr;
    
    if (props.timeRange === '7d' || props.timeRange === '30d') {
      timeStr = `${time.getMonth() + 1}/${time.getDate()}`;
    } else {
      timeStr = `${time.getHours()}:00`;
    }
    
    categories.push(timeStr);
    
    // 模拟一些波动，但保持一定的趋势性
    const change = Math.random() * 15 - 7.5;
    lastValue = Math.max(5, Math.min(95, lastValue + change));
    data.push(Math.round(lastValue));
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
    title: {
      text: 'CPU使用率(%)',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        data: data,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(59, 130, 246)'
            },
            {
              offset: 1,
              color: 'rgb(219, 234, 254)'
            }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#3B82F6'
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: '#F59E0B'
          },
          data: [
            {
              yAxis: 80,
              label: {
                formatter: '警告阈值',
                position: 'end'
              }
            }
          ]
        },
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(239, 68, 68, 0.1)'
          },
          data: [
            [{
              yAxis: 80
            }, {
              yAxis: 100
            }]
          ]
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