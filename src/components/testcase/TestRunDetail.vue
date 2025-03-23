<template>
  <div class="test-run-detail">
    <el-result
      :icon="getResultIcon()"
      :title="getResultTitle()"
      :class="getResultClass()"
    >
      <template #sub-title>
        <div class="result-info">
          <p>测试用例: {{ testRun.testCaseName }}</p>
          <p>执行时间: {{ testRun.runTime }}</p>
          <p>执行人: {{ testRun.executor }}</p>
          <p>测试环境: {{ getEnvironmentName(testRun.environment) }}</p>
        </div>
      </template>
      
      <template #extra>
        <div class="result-actions">
          <el-button type="primary" @click="viewTestCase">查看测试用例</el-button>
          <el-button v-if="testRun.result === '失败'" type="danger" @click="viewBug">查看缺陷</el-button>
          <el-button type="warning" @click="reRunTest">重新执行</el-button>
        </div>
      </template>
    </el-result>
    
    <div class="run-details">
      <el-card>
        <div slot="header" class="card-header">
          <span>执行步骤结果</span>
        </div>
        
        <el-table
          :data="testRun.steps"
          style="width: 100%"
          border
        >
          <el-table-column prop="stepNumber" label="步骤" width="70" />
          <el-table-column prop="action" label="操作步骤" min-width="200" />
          <el-table-column prop="expectedResult" label="预期结果" min-width="200" />
          <el-table-column prop="actualResult" label="实际结果" min-width="200" />
          <el-table-column label="结果" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.pass ? 'success' : 'danger'"
                effect="plain"
              >
                {{ scope.row.pass ? '通过' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <el-card class="notes-card">
        <div slot="header" class="card-header">
          <span>执行备注</span>
        </div>
        <div class="test-notes">
          {{ testRun.notes || '没有备注信息' }}
        </div>
      </el-card>
      
      <el-card v-if="testRun.fileList && testRun.fileList.length > 0" class="attachments-card">
        <div slot="header" class="card-header">
          <span>测试证据附件</span>
        </div>
        <div class="attachments-list">
          <div v-for="(file, index) in testRun.fileList" :key="index" class="attachment-item">
            <el-link :underline="false" type="primary" @click="previewFile(file)">
              <i :class="getFileIcon(file)"></i>
              {{ file.name }}
            </el-link>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
/**
 * @description 测试执行详情组件，显示测试执行的详细信息
 */
export default {
  name: 'TestRunDetail',
  props: {
    /**
     * 测试执行数据
     */
    testRun: {
      type: Object,
      required: true
    }
  },
  methods: {
    /**
     * 获取结果图标
     */
    getResultIcon() {
      const resultMap = {
        '通过': 'success',
        '失败': 'error',
        '阻塞': 'warning',
        '跳过': 'info'
      };
      return resultMap[this.testRun.result] || 'info';
    },
    
    /**
     * 获取结果标题
     */
    getResultTitle() {
      const titleMap = {
        '通过': '测试执行通过',
        '失败': '测试执行失败',
        '阻塞': '测试执行阻塞',
        '跳过': '测试执行跳过'
      };
      return titleMap[this.testRun.result] || '测试已执行';
    },
    
    /**
     * 获取结果样式类
     */
    getResultClass() {
      return `result-${this.testRun.result}`;
    },
    
    /**
     * 获取环境名称
     */
    getEnvironmentName(envCode) {
      const envMap = {
        'development': '开发环境',
        'testing': '测试环境',
        'staging': '预发环境',
        'production': '生产环境'
      };
      return envMap[envCode] || envCode;
    },
    
    /**
     * 获取文件图标
     */
    getFileIcon(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      const iconMap = {
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'xls': 'el-icon-document',
        'xlsx': 'el-icon-document',
        'txt': 'el-icon-document-copy',
        'log': 'el-icon-document-copy',
        'zip': 'el-icon-folder',
        'rar': 'el-icon-folder'
      };
      return iconMap[ext] || 'el-icon-document';
    },
    
    /**
     * 查看测试用例
     */
    viewTestCase() {
      this.$emit('view-test-case', this.testRun.testCaseId);
    },
    
    /**
     * 查看缺陷
     */
    viewBug() {
      if (this.testRun.bugLink) {
        window.open(this.testRun.bugLink, '_blank');
      } else {
        this.$message.info('未关联缺陷链接');
      }
    },
    
    /**
     * 重新执行测试
     */
    reRunTest() {
      this.$emit('re-run-test', this.testRun.testCaseId);
    },
    
    /**
     * 预览文件
     */
    previewFile(file) {
      // 实际应用中应实现文件预览功能
      this.$message.info(`预览文件: ${file.name}`);
    }
  }
}
</script>

<style scoped>
.test-run-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.result-通过 :deep(.el-result__icon) {
  color: #67C23A;
}

.result-失败 :deep(.el-result__icon) {
  color: #F56C6C;
}

.result-阻塞 :deep(.el-result__icon) {
  color: #E6A23C;
}

.result-跳过 :deep(.el-result__icon) {
  color: #909399;
}

.result-info {
  text-align: center;
  line-height: 1.8;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.run-details {
  margin-top: 30px;
}

.card-header {
  font-weight: bold;
}

.notes-card {
  margin-top: 20px;
}

.test-notes {
  white-space: pre-line;
  line-height: 1.5;
  color: #606266;
}

.attachments-card {
  margin-top: 20px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.attachment-item {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 8px 15px;
  background-color: #F5F7FA;
}
</style>