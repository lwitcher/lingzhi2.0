<template>
  <div class="visual-editor-view">
    <h1 class="text-2xl font-bold mb-6">可视化编辑</h1>
    
    <div class="tab-header border-b border-gray-200 mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button 
          @click="activeTab = 'editor'" 
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'editor' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          编辑流程图
        </button>
        <button 
          @click="activeTab = 'gallery'" 
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'gallery' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          我的流程图库
        </button>
      </nav>
    </div>
    
    <div v-if="activeTab === 'editor'" class="editor-container">
      <FlowEditor 
        v-if="!loading" 
        @save="handleSaveFlow"
        ref="flowEditorRef"
      />
      <div v-else class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载编辑器中...</p>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'gallery'" class="gallery-container">
      <FlowGallery @edit-flow="handleEditFlow" />
    </div>
  </div>
</template>

<script>
/**
 * @description 可视化编辑主页面，提供流程图编辑和管理功能
 */
import { ref, onMounted, nextTick } from 'vue';
import FlowEditor from '@/components/visual-editor/FlowEditor.vue';
import FlowGallery from '@/components/visual-editor/FlowGallery.vue';

export default {
  name: 'VisualEditorView',
  components: {
    FlowEditor,
    FlowGallery
  },
  setup() {
    const activeTab = ref('editor');
    const loading = ref(true);
    const flowEditorRef = ref(null);
    const currentFlow = ref(null);
    
    onMounted(() => {
      // 模拟加载延迟
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    });
    
    // 处理保存流程图
    const handleSaveFlow = (flowData) => {
      // 生成唯一ID
      const flowId = currentFlow.value?.id || `flow-${Date.now()}`;
      
      // 创建新的保存对象或更新现有对象
      const flow = {
        id: flowId,
        name: flowData.name,
        description: flowData.description,
        data: flowData.data,
        createdAt: currentFlow.value?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnail: generateThumbnail()
      };
      
      // 保存到本地存储
      const savedFlows = localStorage.getItem('flowEditorSavedFlows');
      let flows = savedFlows ? JSON.parse(savedFlows) : [];
      
      // 检查是否已存在相同ID的流程图
      const existingIndex = flows.findIndex(f => f.id === flowId);
      if (existingIndex !== -1) {
        flows[existingIndex] = flow;
      } else {
        flows.push(flow);
      }
      
      // 保存更新后的流程图列表
      localStorage.setItem('flowEditorSavedFlows', JSON.stringify(flows));
      
      // 提示保存成功
      alert('流程图保存成功!');
    };
    
    // 生成流程图缩略图
    const generateThumbnail = () => {
      // 实际应用中，这里应该从画布生成缩略图
      // 这里简单返回空，实际使用时会展示默认缩略图
      return '';
    };
    
    // 处理编辑已有的流程图
    const handleEditFlow = async (flow) => {
      currentFlow.value = flow;
      activeTab.value = 'editor';
      
      // 等待编辑器组件加载完成
      await nextTick();
      
      // 在编辑器中加载流程图数据
      if (flowEditorRef.value) {
        // 这个方法需要在FlowEditor组件中实现
        // 并且使用expose暴露出来
        flowEditorRef.value.loadFlowData(flow.data);
      }
    };
    
    return {
      activeTab,
      loading,
      flowEditorRef,
      handleSaveFlow,
      handleEditFlow
    };
  }
};
</script>

<style scoped>
.visual-editor-view {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.editor-container, .gallery-container {
  flex: 1;
  min-height: 0;
  position: relative;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(64, 158, 255, 0.1);
  border-top-color: #409eff;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 