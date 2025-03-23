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
  
  // 基础值，可以根据serverId生成不同的数据模式
  let baseValue = 50;
  if (props.serverId !== 'all') {
    const id = parseInt(props.serverId);
    baseValue = 50 + (id % 3) * 8;
  }
  
  // 生成时间序列数据 - 磁盘使用率通常会缓慢上升
  let lastValue = baseValue;
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * step);
    let timeStr;
    
    if (props.timeRange === '7d' || props.timeRange === '30d') {
      timeStr = `${time.getMonth() + 1}/${time.getDate()}`;
    } else {
      timeStr = `${time.getHours()}:00`;
    }
    
    categories.push(timeStr);
    
    // 磁盘使用率一般随时间缓慢上升，偶尔会下降一点（可能是清理了一些文件）
    const change = Math.random() * 1.5 - 0.3; // 大部分时间都是上升
    lastValue = Math.max(20, Math.min(95, lastValue + change));
    data.push(Math.round(lastValue * 10) / 10); // 保留一位小数
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
    title: {
      text: '磁盘使用率(%)',
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
        name: '磁盘使用率',
        type: 'line',
        data: data,
        smooth: true,
        showSymbol: false,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(124, 58, 237)'
            },
            {
              offset: 1,
              color: 'rgb(236, 233, 253)'
            }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#7C3AED'
        },
        markLine: {
          silent: true,
          lineStyle: {
            color: '#F59E0B'
          },
          data: [
            {
              yAxis: 90,
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
              yAxis: 90
            }, {
              yAxis: 100
            }]
          ]
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