<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Search, View, Edit, Delete, RefreshRight } from '@element-plus/icons-vue';

interface Job {
  id: string;
  name: string;
  type: 'manual' | 'scheduled' | 'triggered';
  status: string;
  server: string;
  startTime: string | null;
  endTime: string | null;
  executor: string;
  progress: number;
  description: string;
}

const jobs = ref<Job[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

const currentPage = ref(1);
const pageSize = ref(10);

// 获取状态标签类型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'cancelled': 'warning'
  };
  return statusMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'running': '运行中',
    'completed': '已完成',
    'failed': '失败',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

// 获取任务类型标签类型
const getTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'manual': 'primary',
    'scheduled': 'warning',
    'triggered': 'success'
  };
  return typeMap[type] || '';
};

// 生成模拟数据
const generateMockJobs = (): Job[] => {
  const types = ['manual', 'scheduled', 'triggered'];
  const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
  const servers = ['服务器-01', '服务器-02', '服务器-03', '服务器-04', '服务器-05'];
  const executors = ['系统', '张工程师', '王管理员', '李技术员', '赵主管'];

  return Array.from({ length: 45 }, (_, i) => {
    const id = `JOB-${1000 + i}`;
    const type = types[Math.floor(Math.random() * types.length)];
    const typeNames = {
      manual: '手动',
      scheduled: '定时',
      triggered: '触发'
    };
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const now = new Date();
    const startTime = status !== 'pending' ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString() : null;

    let endTime = null;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      const start = startTime ? new Date(startTime).getTime() : now.getTime();
      endTime = new Date(start + Math.random() * 24 * 60 * 60 * 1000).toLocaleString();
    }

    let progress = 0;
    if (status === 'running') {
      progress = Math.floor(Math.random() * 90) + 10;
    } else if (status === 'completed') {
      progress = 100;
    } else if (status === 'failed' || status === 'cancelled') {
      progress = Math.floor(Math.random() * 100);
    }

    return {
      id,
      name: `${typeNames[type]}任务 ${id}`,
      type,
      status,
      server: servers[Math.floor(Math.random() * servers.length)],
      startTime,
      endTime,
      executor: executors[Math.floor(Math.random() * executors.length)],
      progress,
      description: `这是一个${getStatusText(status)}的${type}任务，运行在${servers[Math.floor(Math.random() * servers.length)]}上。`
    };
  });
};

// 过滤任务
const filterJobs = () => {
  if (!loading.value) {
    const filtered = jobs.value.filter(job => {
      // 搜索查询
      if (searchQuery.value && !job.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
          !job.id.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
          !job.server.toLowerCase().includes(searchQuery.value.toLowerCase())) {
        return false;
      }

      // 状态过滤
      if (statusFilter.value && job.status !== statusFilter.value) {
        return false;
      }

      // 类型过滤
      if (typeFilter.value && job.type !== typeFilter.value) {
        return false;
      }

      return true;
    });

    return filtered;
  }
  return [];
};

// 获取分页数据
const getPaginatedJobs = () => {
  const filtered = filterJobs();
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filtered.slice(start, end);
};

// 页面大小变化处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
};

// 页码变化处理
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 重置过滤器
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  typeFilter.value = '';
};

// 创建新任务
const createNewJob = () => {
  // 在实际项目中，这里应该打开创建任务的表单
  alert('创建新任务的功能正在开发中');
};

// 取消任务
const cancelJob = (job: Job) => {
  if (job.status === 'pending' || job.status === 'running') {
    if (confirm(`确定要取消任务 ${job.id} - ${job.name} 吗？`)) {
      const index = jobs.value.findIndex(j => j.id === job.id);
      if (index !== -1) {
        jobs.value[index].status = 'cancelled';
        jobs.value[index].endTime = new Date().toLocaleString();
      }
    }
  }
};

// 查看任务详情
const viewJobDetails = (job: Job) => {
  // 在实际项目中，这里应该导航到任务详情页面或打开详情对话框
  alert(`查看任务详情: ${job.id} - ${job.name}`);
};

onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    jobs.value = generateMockJobs();
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <div class="job-management p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">任务管理</h1>
      <el-button type="primary" @click="createNewJob">
        <el-icon><Plus /></el-icon> 创建任务
      </el-button>
    </div>

    <!-- 过滤器 -->
    <div class="bg-white p-4 rounded-md shadow-sm mb-6">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8" :md="8" :lg="6">
          <el-input
            v-model="searchQuery"
            placeholder="搜索任务名称、ID或服务器..."
            :prefix-icon="Search"
            clearable
            class="w-full"
          />
        </el-col>

        <el-col :xs="12" :sm="6" :md="6" :lg="4">
          <el-select
            v-model="statusFilter"
            placeholder="状态"
            clearable
            class="w-full"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="运行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-col>

        <el-col :xs="12" :sm="6" :md="6" :lg="4">
          <el-select
            v-model="typeFilter"
            placeholder="任务类型"
            clearable
            class="w-full"
          >
          <el-option label="手动" value="manual" />
          <el-option label="定时" value="scheduled" />
          <el-option label="触发" value="triggered" />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="4" :md="4" :lg="3" class="flex items-center mt-2 sm:mt-0">
          <el-button type="text" @click="resetFilters">
            <el-icon><RefreshRight /></el-icon> 重置过滤器
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-md shadow-sm">
      <el-table
        :data="getPaginatedJobs()"
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <!-- ID列 -->
        <el-table-column prop="id" label="任务ID" width="100" sortable />

        <!-- 名称列 -->
        <el-table-column prop="name" label="任务名称" min-width="180" sortable>
          <template #default="scope">
            <el-link @click="viewJobDetails(scope.row)" type="primary">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>

        <!-- 类型列 -->
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)" size="small">
              {{
                scope.row.type === 'manual' ? '手动' :
                scope.row.type === 'scheduled' ? '定时' : '触发'
              }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 进度列 -->
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="scope.row.status === 'failed' ? 'exception' :
                      scope.row.status === 'completed' ? 'success' : ''"
            />
          </template>
        </el-table-column>

        <!-- 服务器列 -->
        <el-table-column prop="server" label="服务器" width="150" />

        <!-- 执行人列 -->
        <el-table-column prop="executor" label="执行人" width="120" />

        <!-- 开始时间列 -->
        <el-table-column prop="startTime" label="开始时间" width="170">
          <template #default="scope">
            {{ scope.row.startTime || '未开始' }}
          </template>
        </el-table-column>

        <!-- 结束时间列 -->
        <el-table-column prop="endTime" label="结束时间" width="170">
          <template #default="scope">
            {{ scope.row.endTime || '进行中' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="scope">
            <div class="button-group">
              <el-button
                size="small"
                type="primary"
                @click="viewJobDetails(scope.row)"
              >
                <el-icon class="button-icon"><View /></el-icon>
                详情
              </el-button>

              <el-button
                size="small"
                type="danger"
                @click="cancelJob(scope.row)"
                v-if="scope.row.status === 'pending' || scope.row.status === 'running'"
              >
                <el-icon class="button-icon"><Delete /></el-icon>
                取消
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-center p-4">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filterJobs().length"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-management {
  min-height: calc(100vh - 100px);
}

.el-tag {
  text-transform: capitalize;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 5px;
}

/* 按钮样式，使其更小 */
.button-group .el-button {
  padding: 4px 8px !important;
  height: 24px !important;
  line-height: 1 !important;
  font-size: 12px !important;
}

/* 确保按钮内容垂直居中 */
.button-group .el-button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 按钮图标样式 */
.button-icon {
  margin-right: 2px;
  font-size: 12px;
  height: 12px;
  width: 12px;
}
</style>
