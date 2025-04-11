<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TestCaseList from '@/components/testcase/TestCaseList.vue';
import TestCaseDetails from '@/components/testcase/TestCaseDetails.vue';
import TestCaseForm from '@/components/testcase/TestCaseForm.vue';
import { DataAnalysis, Document } from '@element-plus/icons-vue'; // 添加这行

const router = useRouter();

const activeView = ref('list'); // list, details, create, edit
const selectedTestCase = ref(null);
const loading = ref(true);
const filters = ref({
  status: 'all',
  category: 'all',
  search: ''
});

const pageTitle = computed(() => {
  switch (activeView.value) {
    case 'create': return '创建新用例';
    case 'edit': return '编辑用例';
    case 'details': return '用例详情';
    default: return '用例管理';
  }
});

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

const handleViewTestCase = (testCase) => {
  selectedTestCase.value = testCase;
  activeView.value = 'details';
};

const handleEditTestCase = (testCase) => {
  selectedTestCase.value = testCase;
  activeView.value = 'edit';
};

const createMethodDialogVisible = ref(false);

const handleCreateTestCase = () => {
  createMethodDialogVisible.value = true;
};

const handleCreateVisual = () => {
  createMethodDialogVisible.value = false;
  router.push('/visual-editor'); // 使用导入的router对象
};

const handleCreateText = () => {
  createMethodDialogVisible.value = false;
  selectedTestCase.value = null;
  activeView.value = 'create';
};

const handleBackToList = () => {
  activeView.value = 'list';
};

const handleTestCaseSaved = () => {
  activeView.value = 'list';
  loading.value = true;
  
  // 模拟数据重新加载
  setTimeout(() => {
    loading.value = false;
  }, 600);
};

const handleFilterChange = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters };
  // 在实际应用中，这里会触发用例列表的重新加载
};
</script>

<template>
  <div class="testcase-management-container">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ pageTitle }}</h1>
      
      <div v-if="activeView === 'list'" class="flex">
        <button 
          @click="handleCreateTestCase" 
          class="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          创建新用例
        </button>
      </div>
      
      <!-- 创建方式选择对话框 -->
      <el-dialog
        v-model="createMethodDialogVisible"
        title="选择创建方式"
        width="30%"
      >
        <template #default>
          <div class="create-method-options">
            <el-button 
              type="primary" 
              @click="handleCreateVisual"
              class="method-button"
            >
              <el-icon><DataAnalysis /></el-icon>
              可视化创建
            </el-button>
            <el-button 
              type="success" 
              @click="handleCreateText"
              class="method-button"
            >
              <el-icon><Document /></el-icon>
              文字描述生成
            </el-button>
          </div>
        </template>
      </el-dialog>
      
      <div v-if="activeView !== 'list'">
        <button 
          @click="handleBackToList" 
          class="btn btn-secondary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回列表
        </button>
      </div>
    </div>
    
    
    <!-- 加载中 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- 用例列表 -->
    <div v-else-if="activeView === 'list'" class="card">
      <TestCaseList 
        :filters="filters"
        @view-test-case="handleViewTestCase"
        @edit-test-case="handleEditTestCase"
      />
    </div>
    
    <!-- 用例详情 -->
    <div v-else-if="activeView === 'details' && selectedTestCase" class="card">
      <TestCaseDetails 
        :test-case="selectedTestCase" 
        @edit="handleEditTestCase(selectedTestCase)"
      />
    </div>
    
    <!-- 创建/编辑用例表单 -->
    <div v-else-if="activeView === 'create' || activeView === 'edit'" class="card">
      <TestCaseForm 
        :test-case="selectedTestCase"
        :is-edit="activeView === 'edit'"
        @saved="handleTestCaseSaved"
        @cancel="handleBackToList"
      />
    </div>
  </div>
</template>

<style scoped>
.testcase-management-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.create-method-options {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.method-button {
  width: 200px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.method-button .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}
</style>