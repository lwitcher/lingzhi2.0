<template>
  <div class="flow-gallery">
    <div class="gallery-header">
      <h3>我的流程图库</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索流程图..."
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="flow-list" v-loading="loading">
      <el-empty v-if="filteredFlows.length === 0" description="暂无流程图"></el-empty>
      
      <div v-else class="flow-grid">
        <el-card 
          v-for="flow in filteredFlows" 
          :key="flow.id" 
          class="flow-card"
          shadow="hover"
          :body-style="{ padding: '0px' }"
        >
          <div class="flow-preview" @click="handleFlowClick(flow)">
            <img :src="flow.thumbnail || defaultThumbnail" alt="流程图预览" />
          </div>
          <div class="flow-info">
            <div class="flow-title">{{ flow.name }}</div>
            <div class="flow-meta">
              <span>{{ formatDate(flow.createdAt) }}</span>
              <div class="flow-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button 
                    size="small" 
                    type="primary" 
                    circle
                    @click.stop="handleEdit(flow)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button 
                    size="small" 
                    type="danger" 
                    circle
                    @click.stop="handleDelete(flow)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除确认"
      v-model="deleteDialogVisible"
      width="400px"
    >
      <div>确定要删除流程图 "{{ currentFlow.name }}" 吗？此操作不可恢复。</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 流程图库组件，用于展示和管理保存的流程图
 */
import { ref, computed, onMounted } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

export default {
  name: 'FlowGallery',
  components: {
    ...ElementPlusIconsVue
  },
  emits: ['edit-flow'],
  setup(props, { emit }) {
    const flows = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const defaultThumbnail = 'data:image/png;base64,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';
    const deleteDialogVisible = ref(false);
    const currentFlow = ref({});
    
    // 过滤后的流程图列表
    const filteredFlows = computed(() => {
      if (!searchQuery.value) return flows.value;
      
      const query = searchQuery.value.toLowerCase();
      return flows.value.filter(flow => 
        flow.name.toLowerCase().includes(query) || 
        (flow.description && flow.description.toLowerCase().includes(query))
      );
    });
    
    // 加载流程图列表
    onMounted(() => {
      fetchFlows();
    });
    
    // 获取流程图数据
    const fetchFlows = () => {
      loading.value = true;
      
      // 模拟API调用，加载本地存储数据
      setTimeout(() => {
        try {
          const savedFlows = localStorage.getItem('flowEditorSavedFlows');
          flows.value = savedFlows ? JSON.parse(savedFlows) : [];
        } catch (error) {
          console.error('Failed to load saved flows:', error);
          flows.value = [];
        }
        
        loading.value = false;
      }, 500);
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };
    
    // 点击流程图
    const handleFlowClick = (flow) => {
      handleEdit(flow);
    };
    
    // 编辑流程图
    const handleEdit = (flow) => {
      emit('edit-flow', flow);
    };
    
    // 删除流程图
    const handleDelete = (flow) => {
      currentFlow.value = flow;
      deleteDialogVisible.value = true;
    };
    
    // 确认删除
    const confirmDelete = () => {
      flows.value = flows.value.filter(flow => flow.id !== currentFlow.value.id);
      
      // 保存到本地存储
      localStorage.setItem('flowEditorSavedFlows', JSON.stringify(flows.value));
      
      // 关闭对话框
      deleteDialogVisible.value = false;
      
      // 清空当前选中流程
      currentFlow.value = {};
    };
    
    return {
      flows,
      loading,
      searchQuery,
      filteredFlows,
      defaultThumbnail,
      deleteDialogVisible,
      currentFlow,
      formatDate,
      handleFlowClick,
      handleEdit,
      handleDelete,
      confirmDelete
    };
  }
};
</script>

<style scoped>
.flow-gallery {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.gallery-header h3 {
  margin: 0;
  font-size: 18px;
}

.search-input {
  width: 240px;
}

.flow-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.flow-card {
  width: 100%;
  height: 220px;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.flow-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.flow-preview {
  height: 160px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f8f8f8;
}

.flow-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flow-info {
  padding: 8px 12px;
}

.flow-title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.flow-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.flow-actions {
  display: flex;
  gap: 8px;
}

/* 确保小图标按钮居中对齐 */
.flow-actions .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}
</style> 