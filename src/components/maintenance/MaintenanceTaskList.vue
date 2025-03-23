<template>
  <div class="maintenance-task-list">
    <h2>维护任务列表</h2>
    
    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索任务..."
        :prefix-icon="Search"
        clearable
        @input="filterTasks"
        class="search-input"
      />
      
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="filterTasks" class="status-filter">
        <el-option label="全部" value="" />
        <el-option label="待处理" value="pending" />
        <el-option label="进行中" value="in-progress" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </div>

    <el-table
      :data="filteredTasks"
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="taskId" label="任务ID" width="100" />
      <el-table-column prop="title" label="任务名称" width="200" />
      <el-table-column prop="serverName" label="服务器" width="150" />
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <el-tag :type="scope.row ? getPriorityType(scope.row.priority) : ''">
            {{ scope.row ? scope.row.priority : '' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row ? getStatusType(scope.row.status) : ''">
            {{ scope.row ? getStatusText(scope.row.status) : '' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="assignee" label="负责人" width="120" />
      <el-table-column prop="scheduledTime" label="计划时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button 
            v-if="scope.row"
            size="small" 
            type="primary" 
            @click="viewTask(scope.row)"
          >
            <el-icon><View /></el-icon>
            查看
          </el-button>
          <el-button 
            v-if="scope.row"
            size="small" 
            type="success" 
            @click="editTask(scope.row)"
            :disabled="scope.row.status === 'completed'"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTasks"
      />
    </div>
  </div>
</template>

<script>
/**
 * @description 维护任务列表组件，用于显示所有维护任务
 */
import { Search, View, Edit } from '@element-plus/icons-vue';

export default {
  name: 'MaintenanceTaskList',
  components: {
    Search,
    View,
    Edit
  },
  props: {
    /**
     * 指定是否只显示历史任务
     */
    historyMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tasks: [],
      filteredTasks: [],
      loading: false,
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      totalTasks: 0,
      Search, // 图标引用
      View,   // 图标引用
      Edit    // 图标引用
    }
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    /**
     * 获取任务列表
     */
    fetchTasks() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.tasks = this.generateMockTasks();
        this.filterTasks();
        this.loading = false;
      }, 800);
    },
    
    /**
     * 根据筛选条件过滤任务
     */
    filterTasks() {
      let result = [...this.tasks];
      
      // 关键词搜索
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(task => 
          task.title.toLowerCase().includes(query) || 
          task.serverName.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query)
        );
      }
      
      // 状态筛选
      if (this.statusFilter) {
        result = result.filter(task => task.status === this.statusFilter);
      }
      
      // 历史模式下只显示已完成或已取消的任务
      if (this.historyMode) {
        result = result.filter(task => 
          task.status === 'completed' || task.status === 'cancelled'
        );
      }
      
      this.totalTasks = result.length;
      
      // 分页处理
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.filteredTasks = result.slice(start, end);
    },
    
    /**
     * 查看任务详情
     */
    viewTask(task) {
      this.$emit('view-task', task);
    },
    
    /**
     * 编辑任务
     */
    editTask(task) {
      this.$emit('edit-task', task);
    },
    
    /**
     * 获取状态标签样式
     */
    getStatusType(status) {
      const types = {
        'pending': 'info',
        'in-progress': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
      };
      return types[status] || 'info';
    },
    
    /**
     * 获取状态显示文本
     */
    getStatusText(status) {
      const texts = {
        'pending': '待处理',
        'in-progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return texts[status] || status;
    },
    
    /**
     * 获取优先级标签样式
     */
    getPriorityType(priority) {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      };
      return types[priority] || '';
    },
    
    /**
     * 处理每页显示数量变化
     */
    handleSizeChange(size) {
      this.pageSize = size;
      this.filterTasks();
    },
    
    /**
     * 处理页码变化
     */
    handleCurrentChange(page) {
      this.currentPage = page;
      this.filterTasks();
    },
    
    /**
     * 生成模拟数据 (实际项目中应从API获取)
     */
    generateMockTasks() {
      const statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      const priorities = ['高', '中', '低'];
      const servers = ['Web服务器01', '数据库服务器02', '应用服务器03', '文件服务器04'];
      const assignees = ['张工程师', '李管理员', '王技术员', '赵主管'];
      
      return Array.from({ length: 35 }, (_, i) => ({
        taskId: `MT${1000 + i}`,
        title: `维护任务 ${i + 1}`,
        description: `这是维护任务${i + 1}的详细描述...`,
        serverName: servers[Math.floor(Math.random() * servers.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        scheduledTime: this.getRandomDate(),
        createdAt: this.getRandomDate(true),
        notes: '维护笔记...'
      }));
    },
    
    /**
     * 生成随机日期
     */
    getRandomDate(past = false) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      
      const offset = past ? -30 : 30; // 过去或未来30天内
      const random = Math.floor(Math.random() * offset);
      
      const date = new Date(year, month, day + random);
      return date.toLocaleString('zh-CN');
    }
  }
}
</script>

<style scoped>
.maintenance-task-list {
  padding: 20px;
}

.filters {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
  margin-right: 15px;
}

.status-filter {
  width: 150px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>