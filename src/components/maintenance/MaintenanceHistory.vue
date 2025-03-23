<template>
  <div class="maintenance-history">
    <h2>维护历史记录</h2>
    
    <div class="filters">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @change="handleDateChange"
        class="date-range"
      />
      
      <el-select v-model="serverFilter" placeholder="服务器筛选" @change="loadHistory" clearable class="server-filter">
        <el-option 
          v-for="server in servers" 
          :key="server.id" 
          :label="server.name" 
          :value="server.id"
        />
      </el-select>
      
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="loadHistory" clearable class="status-filter">
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
    </div>
    
    <el-timeline v-if="historyItems.length > 0">
      <el-timeline-item
        v-for="item in historyItems"
        :key="item.id"
        :timestamp="item.completedTime || item.cancelledTime"
        :type="item.status === 'completed' ? 'success' : 'danger'"
      >
        <template #dot>
          <el-icon :class="item.status === 'completed' ? 'success-icon' : 'danger-icon'">
            <Check v-if="item.status === 'completed'" />
            <Close v-else />
          </el-icon>
        </template>
        
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span class="task-title">{{ item.title }}</span>
              <el-tag size="small" :type="item.status === 'completed' ? 'success' : 'danger'">
                {{ item.status === 'completed' ? '已完成' : '已取消' }}
              </el-tag>
            </div>
          </template>
          
          <div class="card-content">
            <div class="info-row">
              <span class="info-label">服务器：</span>
              <span>{{ item.serverName }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">负责人：</span>
              <span>{{ item.assignee }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">计划时间：</span>
              <span>{{ item.scheduledTime }}</span>
            </div>
            
            <div class="info-row" v-if="item.status === 'completed'">
              <span class="info-label">实际耗时：</span>
              <span>{{ item.actualDuration }} 小时</span>
            </div>
            
            <div class="info-row" v-if="item.status === 'cancelled'">
              <span class="info-label">取消原因：</span>
              <span>{{ item.cancelReason || '未提供' }}</span>
            </div>
            
            <div class="info-row description">
              <span class="info-label">任务详情：</span>
              <span>{{ item.description }}</span>
            </div>
            
            <div v-if="item.status === 'completed' && item.maintenanceItems.length > 0">
              <div class="items-header">维护项目完成情况：</div>
              <el-table :data="item.maintenanceItems" size="small" class="items-table">
                <el-table-column prop="name" label="维护项目" />
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="scope">
                    <el-tag 
                      :type="scope.row.status === 'completed' ? 'success' : 
                              scope.row.status === 'skipped' ? 'warning' : 'info'"
                      size="mini"
                    >
                      {{ getItemStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <div class="actions">
              <el-button 
                type="primary" 
                size="small" 
                plain 
                @click="viewDetails(item)"
              >
                查看详情
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                plain 
                @click="exportReport(item)"
              >
                <el-icon><Document /></el-icon>
                导出报告
              </el-button>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    
    <el-empty 
      v-else 
      description="暂无维护历史记录" 
      :image-size="100"
    />
    
    <div class="pagination-container" v-if="historyItems.length > 0">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="totalItems"
      />
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      title="维护任务详情"
      v-model="detailDialogVisible"
      width="70%"
      class="detail-dialog"
    >
      <div v-if="selectedItem" class="detail-content">
        <el-descriptions border direction="vertical" :column="2">
          <el-descriptions-item label="任务ID">{{ selectedItem.taskId }}</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="selectedItem.status === 'completed' ? 'success' : 'danger'">
              {{ selectedItem.status === 'completed' ? '已完成' : '已取消' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="服务器">{{ selectedItem.serverName }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedItem.assignee }}</el-descriptions-item>
          <el-descriptions-item label="计划时间">{{ selectedItem.scheduledTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ selectedItem.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="维护类型">{{ getTypeText(selectedItem.type) }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(selectedItem.priority)">{{ selectedItem.priority }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="系统影响" :span="2">
            {{ getImpactText(selectedItem.systemImpact) }}
          </el-descriptions-item>
          <el-descriptions-item label="任务详情" :span="2">
            {{ selectedItem.description }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="completion-info" v-if="selectedItem.status === 'completed'">
          <h3>完成信息</h3>
          <el-descriptions border :column="2">
            <el-descriptions-item label="完成时间">{{ selectedItem.completedTime }}</el-descriptions-item>
            <el-descriptions-item label="实际耗时">{{ selectedItem.actualDuration }} 小时</el-descriptions-item>
            <el-descriptions-item label="完成备注" :span="2">{{ selectedItem.completionNotes || '无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="cancellation-info" v-if="selectedItem.status === 'cancelled'">
          <h3>取消信息</h3>
          <el-descriptions border :column="2">
            <el-descriptions-item label="取消时间">{{ selectedItem.cancelledTime }}</el-descriptions-item>
            <el-descriptions-item label="取消人">{{ selectedItem.cancelledBy || selectedItem.assignee }}</el-descriptions-item>
            <el-descriptions-item label="取消原因" :span="2">{{ selectedItem.cancelReason || '未提供' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <h3>维护项目</h3>
        <el-table :data="selectedItem.maintenanceItems" border stripe class="detail-table">
          <el-table-column prop="name" label="维护项目" />
          <el-table-column prop="status" label="状态" width="180">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'completed' ? 'success' : 
                        scope.row.status === 'skipped' ? 'warning' : 'info'"
              >
                {{ getItemStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 维护历史记录组件，用于查看历史维护任务记录
 */
import { Check, Close, Document } from '@element-plus/icons-vue';

export default {
  name: 'MaintenanceHistory',
  components: {
    Check,
    Close,
    Document
  },
  data() {
    return {
      historyItems: [],
      dateRange: [],
      serverFilter: '',
      statusFilter: '',
      loading: false,
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      detailDialogVisible: false,
      selectedItem: null,
      // 日期选择器配置
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      },
      // 模拟数据 - 实际应从API获取
      servers: [
        { id: 1, name: 'Web服务器01' },
        { id: 2, name: '数据库服务器02' },
        { id: 3, name: '应用服务器03' },
        { id: 4, name: '文件服务器04' }
      ],
      allHistoryItems: [], // 用于保存所有记录以便筛选
      // 添加图标引用
      Check,
      Close,
      Document
    };
  },
  created() {
    // 默认加载最近一个月的数据
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
    this.dateRange = [start, end];
    
    this.loadHistory();
  },
  methods: {
    /**
     * 加载历史数据
     */
    loadHistory() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.allHistoryItems = this.generateMockHistory();
        this.filterHistory();
        this.loading = false;
      }, 800);
    },
    
    /**
     * 根据筛选条件过滤历史记录
     */
    filterHistory() {
      let result = [...this.allHistoryItems];
      
      // 日期筛选
      if (this.dateRange && this.dateRange.length === 2) {
        const [start, end] = this.dateRange;
        if (start && end) {
          result = result.filter(item => {
            const itemDate = this.parseDate(item.status === 'completed' ? item.completedTime : item.cancelledTime);
            return itemDate >= start && itemDate <= end;
          });
        }
      }
      
      // 服务器筛选
      if (this.serverFilter) {
        result = result.filter(item => 
          String(item.serverId) === String(this.serverFilter)
        );
      }
      
      // 状态筛选
      if (this.statusFilter) {
        result = result.filter(item => item.status === this.statusFilter);
      }
      
      this.totalItems = result.length;
      
      // 分页处理
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.historyItems = result.slice(start, end);
    },
    
    /**
     * 解析日期字符串为日期对象
     */
    parseDate(dateString) {
      if (!dateString) return null;
      const parts = dateString.split(/[\/\s\:]/);
      if (parts.length >= 6) {
        const [year, month, day, hour, minute, second] = parts;
        return new Date(year, month - 1, day, hour, minute, second);
      }
      return new Date(dateString);
    },
    
    /**
     * 处理日期范围变化
     */
    handleDateChange() {
      this.filterHistory();
    },
    
    /**
     * 获取维护项目状态显示文本
     */
    getItemStatusText(status) {
      const statusMap = {
        'pending': '待执行',
        'completed': '已完成',
        'skipped': '已跳过'
      };
      return statusMap[status] || status;
    },
    
    /**
     * 获取维护类型显示文本
     */
    getTypeText(type) {
      const typeMap = {
        'routine': '例行维护',
        'emergency': '紧急修复',
        'upgrade': '升级优化',
        'other': '其他'
      };
      return typeMap[type] || type;
    },
    
    /**
     * 获取优先级类型
     */
    getPriorityType(priority) {
      const priorityMap = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      };
      return priorityMap[priority] || '';
    },
    
    /**
     * 获取系统影响显示文本
     */
    getImpactText(impacts) {
      if (!impacts || impacts.length === 0) return '无';
      
      const impactMap = {
        'service_interruption': '服务中断',
        'performance_degradation': '性能下降',
        'no_impact': '无影响'
      };
      
      return impacts.map(impact => impactMap[impact] || impact).join('、');
    },
    
    /**
     * 查看任务详情
     */
    viewDetails(item) {
      this.selectedItem = JSON.parse(JSON.stringify(item));
      this.detailDialogVisible = true;
    },
    
    /**
     * 导出维护报告
     */
    exportReport(item) {
      this.$message.success(`正在导出 ${item.taskId} 的维护报告...`);
      // 这里应该实现报告导出功能
      setTimeout(() => {
        this.$message.success('报告导出成功！');
      }, 1500);
    },
    
    /**
     * 处理每页显示数量变化
     */
    handleSizeChange(size) {
      this.pageSize = size;
      this.filterHistory();
    },
    
    /**
     * 处理页码变化
     */
    handleCurrentChange(page) {
      this.currentPage = page;
      this.filterHistory();
    },
    
    /**
     * 生成模拟历史数据 (实际项目中应从API获取)
     */
    generateMockHistory() {
      const statuses = ['completed', 'cancelled'];
      const types = ['routine', 'emergency', 'upgrade', 'other'];
      const priorities = ['高', '中', '低'];
      const serverIds = [1, 2, 3, 4];
      const serverNames = ['Web服务器01', '数据库服务器02', '应用服务器03', '文件服务器04'];
      const assignees = ['张工程师', '李管理员', '王技术员', '赵主管'];
      const impacts = [['service_interruption'], ['performance_degradation'], ['no_impact'], ['service_interruption', 'performance_degradation']];
      const cancelReasons = [
        '计划变更', 
        '硬件问题未解决', 
        '需求变更', 
        '资源冲突', 
        '紧急事务优先处理'
      ];
      
      return Array.from({ length: 50 }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const serverIndex = Math.floor(Math.random() * serverIds.length);
        const createdDate = this.getRandomPastDate(120); // 最近120天内创建
        const scheduledDate = new Date(createdDate);
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 10 + 1));
        
        let completedTime = null;
        let cancelledTime = null;
        let actualDuration = null;
        let completionNotes = null;
        let cancelReason = null;
        
        if (status === 'completed') {
          const completionDate = new Date(scheduledDate);
          completionDate.setHours(completionDate.getHours() + Math.floor(Math.random() * 5 + 1));
          completedTime = completionDate.toLocaleString('zh-CN');
          actualDuration = Math.floor(Math.random() * 5 + 1);
          completionNotes = `维护任务已顺利完成，${Math.random() > 0.5 ? '系统恢复正常运行' : '所有检查项目均已通过'}。`;
        } else {
          const cancellationDate = new Date(scheduledDate);
          cancellationDate.setHours(cancellationDate.getHours() - Math.floor(Math.random() * 12 + 1));
          cancelledTime = cancellationDate.toLocaleString('zh-CN');
          cancelReason = cancelReasons[Math.floor(Math.random() * cancelReasons.length)];
        }
        
        return {
          id: i + 1,
          taskId: `MT${1000 + i}`,
          title: `${serverNames[serverIndex]}维护任务 ${i + 1}`,
          serverId: serverIds[serverIndex],
          serverName: serverNames[serverIndex],
          type: types[Math.floor(Math.random() * types.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          createdAt: createdDate.toLocaleString('zh-CN'),
          scheduledTime: scheduledDate.toLocaleString('zh-CN'),
          description: `这是对${serverNames[serverIndex]}的${Math.random() > 0.5 ? '常规维护' : '性能优化'}任务，包括${Math.random() > 0.5 ? '系统升级' : '安全补丁安装'}。`,
          status,
          completedTime,
          cancelledTime,
          actualDuration,
          completionNotes,
          cancelReason,
          systemImpact: impacts[Math.floor(Math.random() * impacts.length)],
          maintenanceItems: this.generateMockItems(status)
        };
      });
    },
    
    /**
     * 生成随机维护项目
     */
    generateMockItems(parentStatus) {
      const itemCount = Math.floor(Math.random() * 5 + 2); // 2-6个项目
      const items = [];
      
      const itemNames = [
        '系统更新安装',
        '数据库备份',
        '硬盘空间清理',
        '日志文件归档',
        '防火墙配置更新',
        '安全补丁安装',
        '性能测试',
        '配置文件优化',
        '内存检查',
        'CPU压力测试'
      ];
      
      for (let i = 0; i < itemCount; i++) {
        let status = 'completed';
        if (parentStatus === 'cancelled') {
          status = Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'skipped' : 'pending';
        } else if (Math.random() > 0.8) {
          status = 'skipped';
        }
        
        items.push({
          name: itemNames[Math.floor(Math.random() * itemNames.length)],
          status,
          notes: status === 'skipped' ? '由于系统兼容性问题跳过' : ''
        });
      }
      
      return items;
    },
    
    /**
     * 生成随机过去日期
     */
    getRandomPastDate(days) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      return date;
    }
  }
}
</script>

<style scoped>
.maintenance-history {
  padding: 20px;
}

.filters {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
}

.date-range {
  width: 350px;
  margin-right: 15px;
}

.server-filter, .status-filter {
  width: 150px;
  margin-right: 15px;
}

.history-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-weight: bold;
}

.card-content {
  font-size: 14px;
}

.info-row {
  margin-bottom: 8px;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
}

.description {
  margin-top: 10px;
}

.items-header {
  font-weight: bold;
  margin: 15px 0 8px 0;
}

.items-table {
  margin-bottom: 15px;
}

.actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.completion-info, .cancellation-info {
  margin-top: 20px;
  margin-bottom: 20px;
}

.detail-table {
  margin-top: 10px;
}
</style>