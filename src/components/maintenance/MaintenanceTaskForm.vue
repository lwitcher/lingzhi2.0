<template>
  <div class="maintenance-task-form">
    <el-form 
      ref="taskForm" 
      :model="taskForm" 
      :rules="rules" 
      label-width="120px"
      label-position="right"
      status-icon
    >
      <el-form-item label="任务标题" prop="title">
        <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
      </el-form-item>
      
      <el-form-item label="服务器" prop="serverId">
        <el-select 
          v-model="taskForm.serverId" 
          placeholder="选择服务器" 
          filterable
          @change="handleServerChange"
          style="width: 100%"
        >
          <el-option 
            v-for="server in servers" 
            :key="server.id" 
            :label="server.name" 
            :value="server.id"
          >
            <div class="server-option">
              <span>{{ server.name }}</span>
              <span class="server-ip">{{ server.ip }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="维护类型" prop="type">
        <el-radio-group v-model="taskForm.type">
          <el-radio label="routine">例行维护</el-radio>
          <el-radio label="emergency">紧急修复</el-radio>
          <el-radio label="upgrade">升级优化</el-radio>
          <el-radio label="other">其他</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="taskForm.priority" placeholder="选择优先级" style="width: 100%">
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="负责人" prop="assignee">
        <el-select 
          v-model="taskForm.assignee" 
          placeholder="选择负责人" 
          filterable
          style="width: 100%"
        >
          <el-option 
            v-for="engineer in engineers" 
            :key="engineer.id" 
            :label="engineer.name" 
            :value="engineer.name"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="计划时间" prop="scheduledTime">
        <el-date-picker
          v-model="taskForm.scheduledTime"
          type="datetime"
          placeholder="选择计划维护时间"
          style="width: 100%"
          :disabled-date="disablePastDates"
        />
      </el-form-item>
      
      <el-form-item label="预计耗时" prop="estimatedDuration">
        <el-input-number 
          v-model="taskForm.estimatedDuration" 
          :min="1" 
          :max="24"
          style="width: 180px"
        />
        <span class="duration-unit">小时</span>
      </el-form-item>
      
      <el-form-item label="任务详情" prop="description">
        <el-input 
          v-model="taskForm.description" 
          type="textarea" 
          :rows="4" 
          placeholder="请详细描述维护任务内容..."
        />
      </el-form-item>
      
      <el-form-item label="维护项目" prop="maintenanceItems">
        <div v-for="(item, index) in taskForm.maintenanceItems" :key="index" class="maintenance-item">
          <el-input 
            v-model="item.name" 
            placeholder="维护项目名称" 
            class="item-input"
          />
          <el-select 
            v-model="item.status" 
            placeholder="状态" 
            class="item-status"
          >
            <el-option label="待执行" value="pending" />
            <el-option label="已完成" value="completed" />
            <el-option label="跳过" value="skipped" />
          </el-select>
          <el-button 
            type="danger" 
            circle 
            @click="removeItem(index)"
            class="item-delete"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        
        <el-button 
          type="primary" 
          plain 
          @click="addItem"
          style="margin-top: 10px"
        >
          <el-icon><Plus /></el-icon>
          添加维护项目
        </el-button>
      </el-form-item>
      
      <el-form-item label="系统影响" prop="systemImpact">
        <el-checkbox-group v-model="taskForm.systemImpact">
          <el-checkbox label="service_interruption">服务中断</el-checkbox>
          <el-checkbox label="performance_degradation">性能下降</el-checkbox>
          <el-checkbox label="no_impact">无影响</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">保存任务</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button v-if="isEdit" type="danger" @click="confirmCancel">取消任务</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 取消任务的确认对话框 -->
    <el-dialog
      title="确认取消任务"
      v-model="cancelDialogVisible"
      width="30%"
    >
      <span>您确定要取消此维护任务吗？此操作无法撤销。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="cancelTask">确认取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 维护任务表单组件，用于创建或编辑维护任务
 */
import { Delete, Plus } from '@element-plus/icons-vue';

export default {
  name: 'MaintenanceTaskForm',
  components: {
    Delete,
    Plus
  },
  props: {
    /**
     * 编辑模式时传入的任务数据
     */
    taskData: {
      type: Object,
      default: () => null
    },
    /**
     * 是否为编辑模式
     */
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      taskForm: {
        title: '',
        serverId: '',
        serverName: '',
        type: 'routine',
        priority: '中',
        assignee: '',
        scheduledTime: '',
        estimatedDuration: 2,
        description: '',
        maintenanceItems: [
          { name: '', status: 'pending' }
        ],
        systemImpact: ['no_impact'],
        status: 'pending'
      },
      rules: {
        title: [
          { required: true, message: '请输入任务标题', trigger: 'blur' },
          { min: 3, max: 50, message: '长度应为3到50个字符', trigger: 'blur' }
        ],
        serverId: [
          { required: true, message: '请选择服务器', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择维护类型', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        assignee: [
          { required: true, message: '请选择负责人', trigger: 'change' }
        ],
        scheduledTime: [
          { required: true, message: '请选择计划时间', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入任务详情', trigger: 'blur' },
          { min: 10, max: 500, message: '长度应为10到500个字符', trigger: 'blur' }
        ]
      },
      submitting: false,
      cancelDialogVisible: false,
      // 模拟数据 - 实际应从API获取
      servers: [
        { id: 1, name: 'Web服务器01', ip: '192.168.1.101' },
        { id: 2, name: '数据库服务器02', ip: '192.168.1.102' },
        { id: 3, name: '应用服务器03', ip: '192.168.1.103' },
        { id: 4, name: '文件服务器04', ip: '192.168.1.104' }
      ],
      engineers: [
        { id: 1, name: '张工程师' },
        { id: 2, name: '李管理员' },
        { id: 3, name: '王技术员' },
        { id: 4, name: '赵主管' }
      ]
    }
  },
  created() {
    if (this.isEdit && this.taskData) {
      this.initFormData();
    }
  },
  methods: {
    /**
     * 初始化表单数据（编辑模式）
     */
    initFormData() {
      // 复制任务数据到表单
      this.taskForm = { ...this.taskData };
      
      // 确保维护项目至少有一项
      if (!this.taskForm.maintenanceItems || this.taskForm.maintenanceItems.length === 0) {
        this.taskForm.maintenanceItems = [{ name: '', status: 'pending' }];
      }
      
      // 设置系统影响的默认值
      if (!this.taskForm.systemImpact || this.taskForm.systemImpact.length === 0) {
        this.taskForm.systemImpact = ['no_impact'];
      }
    },
    
    /**
     * 添加维护项目
     */
    addItem() {
      this.taskForm.maintenanceItems.push({ name: '', status: 'pending' });
    },
    
    /**
     * 移除维护项目
     */
    removeItem(index) {
      this.taskForm.maintenanceItems.splice(index, 1);
      // 确保至少有一个维护项目
      if (this.taskForm.maintenanceItems.length === 0) {
        this.addItem();
      }
    },
    
    /**
     * 处理服务器变更
     */
    handleServerChange(serverId) {
      const server = this.servers.find(s => s.id === serverId);
      if (server) {
        this.taskForm.serverName = server.name;
      }
    },
    
    /**
     * 禁用过去的日期
     */
    disablePastDates(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0));
    },
    
    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          this.submitting = true;
          
          // 移除空的维护项目
          this.taskForm.maintenanceItems = this.taskForm.maintenanceItems.filter(
            item => item.name.trim() !== ''
          );
          
          // 模拟API调用
          setTimeout(() => {
            // 这里应该是真实的API调用
            if (this.isEdit) {
              this.$emit('task-updated', { ...this.taskForm });
              this.$message.success('维护任务已更新');
            } else {
              // 添加创建时间和任务ID
              const newTask = {
                ...this.taskForm,
                taskId: 'MT' + new Date().getTime().toString().slice(-4),
                createdAt: new Date().toLocaleString('zh-CN')
              };
              this.$emit('task-created', newTask);
              this.$message.success('维护任务已创建');
              this.resetForm();
            }
            
            this.submitting = false;
          }, 800);
        } else {
          this.$message.error('请检查表单填写是否正确');
          return false;
        }
      });
    },
    
    /**
     * 重置表单
     */
    resetForm() {
      this.$refs.taskForm.resetFields();
      // 重置维护项目
      this.taskForm.maintenanceItems = [{ name: '', status: 'pending' }];
    },
    
    /**
     * 确认取消任务
     */
    confirmCancel() {
      this.cancelDialogVisible = true;
    },
    
    /**
     * 取消任务
     */
    cancelTask() {
      // 将任务状态设为已取消
      const updatedTask = {
        ...this.taskForm,
        status: 'cancelled'
      };
      
      // 模拟API调用
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.$emit('task-cancelled', updatedTask);
        this.$message.warning('维护任务已取消');
        this.cancelDialogVisible = false;
      }, 500);
    }
  }
}
</script>

<style scoped>
.maintenance-task-form {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.server-option {
  display: flex;
  justify-content: space-between;
}

.server-ip {
  color: #909399;
  font-size: 0.9em;
}

.maintenance-item {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
}

.item-input {
  flex: 3;
  margin-right: 10px;
}

.item-status {
  flex: 1;
  margin-right: 10px;
}

.duration-unit {
  margin-left: 10px;
  color: #606266;
}
</style>