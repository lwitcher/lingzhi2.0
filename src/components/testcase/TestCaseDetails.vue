<template>
  <div class="test-case-details">
    <div class="details-header">
      <div class="header-left">
        <el-tag class="case-id-tag">ID: {{ testCase.id }}</el-tag>
        <h2 class="case-title">{{ testCase.name }}</h2>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            icon="el-icon-edit" 
            size="small"
            @click="handleEdit"
            :disabled="!canEdit"
          >
            编辑
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-video-play" 
            size="small"
            @click="handleExecute"
          >
            执行
          </el-button>
          <el-button 
            type="info" 
            icon="el-icon-document-copy" 
            size="small"
            @click="handleClone"
          >
            克隆
          </el-button>
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            size="small"
            @click="handleDelete"
            :disabled="!canEdit"
          >
            删除
          </el-button>
        </el-button-group>
      </div>
    </div>

    <el-row :gutter="20" class="details-content">
      <el-col :span="18">
        <el-card class="main-info-card">
          <div slot="header" class="card-header">
            <span>基本信息</span>
            <div class="info-badges">
              <el-tag :type="getCategoryType(testCase.category)" size="medium">{{ testCase.category }}</el-tag>
              <el-tag :type="getPriorityType(testCase.priority)" size="medium">{{ testCase.priority }}</el-tag>
              <el-tag :type="getStatusType(testCase.status)" size="medium">{{ getStatusText(testCase.status) }}</el-tag>
            </div>
          </div>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="所属模块">{{ testCase.module || '未分类' }}</el-descriptions-item>
            <el-descriptions-item label="预计执行时间">{{ testCase.estimatedDuration || '-' }} 分钟</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ testCase.creator }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ testCase.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="最近修改人">{{ testCase.lastModifiedBy || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最近修改时间">{{ testCase.lastModifiedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="关联需求" :span="2">
              <div v-if="testCase.relatedRequirements">
                <el-tag 
                  v-for="req in getRequirementsList(testCase.relatedRequirements)" 
                  :key="req"
                  effect="plain"
                  class="requirement-tag"
                  @click="viewRequirement(req)"
                >
                  {{ req }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="测试环境" :span="2">{{ testCase.testEnvironment || '-' }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <div v-if="testCase.tags && testCase.tags.length">
                <el-tag 
                  v-for="tag in testCase.tags" 
                  :key="tag"
                  size="small"
                  class="case-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>

          <div class="section-title">用例描述</div>
          <div class="description-content">{{ testCase.description || '无描述' }}</div>
          
          <div class="section-title">前置条件</div>
          <div class="preconditions-content">{{ testCase.preconditions || '无前置条件' }}</div>
          
          <div class="section-title">测试步骤</div>
          <el-table
            :data="testCase.steps"
            style="width: 100%"
            border
            class="steps-table"
          >
            <el-table-column prop="stepNumber" label="步骤" width="70" />
            <el-table-column prop="action" label="操作步骤" min-width="250" />
            <el-table-column prop="expectedResult" label="预期结果" min-width="250" />
          </el-table>
          
          <div v-if="testCase.notes" class="section-title">备注</div>
          <div v-if="testCase.notes" class="notes-content">{{ testCase.notes }}</div>
          
          <div v-if="testCase.attachments && testCase.attachments.length" class="section-title">附件</div>
          <div v-if="testCase.attachments && testCase.attachments.length" class="attachments-list">
            <div v-for="(file, index) in testCase.attachments" :key="index" class="attachment-item">
              <el-link :underline="false" type="primary" @click="viewAttachment(file)">
                <i :class="getFileIcon(file)"></i>
                {{ file.name }}
                <span class="file-size">({{ formatFileSize(file.size) }})</span>
              </el-link>
            </div>
          </div>
        </el-card>
        
        <el-card v-if="testCase.runHistory && testCase.runHistory.length" class="history-card">
          <div slot="header" class="card-header">
            <span>执行历史</span>
            <el-button type="text" @click="viewAllHistory">查看全部</el-button>
          </div>
          
          <el-timeline>
            <el-timeline-item
              v-for="(history, index) in recentHistory"
              :key="index"
              :type="getResultTimelineType(history.result)"
              :color="getResultTimelineColor(history.result)"
              :timestamp="history.runTime"
              placement="top"
            >
              <el-card class="history-item-card">
                <div class="history-item-header">
                  <el-tag :type="getResultType(history.result)">{{ history.result }}</el-tag>
                  <span class="history-executor">执行人: {{ history.executor }}</span>
                </div>
                <div class="history-environment">环境: {{ getEnvironmentName(history.environment) }}</div>
                <div v-if="history.notes" class="history-notes">{{ history.notes }}</div>
                <div class="history-actions">
                  <el-button 
                    type="text" 
                    size="small"
                    @click="viewRunDetail(history)"
                  >
                    查看详情
                  </el-button>
                  <el-button 
                    v-if="history.result === '失败' && history.bugLink"
                    type="text" 
                    size="small"
                    @click="openBugLink(history.bugLink)"
                  >
                    查看缺陷
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="status-card">
          <div slot="header" class="card-header">
            <span>执行状态</span>
          </div>
          
          <div class="status-summary">
            <div class="last-result">
              <div class="summary-label">最近执行结果</div>
              <div v-if="testCase.lastRunResult" class="summary-value">
                <el-tag :type="getResultType(testCase.lastRunResult)" size="medium">
                  {{ testCase.lastRunResult }}
                </el-tag>
              </div>
              <div v-else class="summary-value no-data">未执行</div>
            </div>
            
            <div class="last-run-time">
              <div class="summary-label">最近执行时间</div>
              <div class="summary-value">{{ testCase.lastRunTime || '未执行' }}</div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="execution-stats">
            <h4>执行统计</h4>
            <div v-if="executionStats.total > 0">
              <div class="stats-row">
                <span>总执行次数:</span>
                <span>{{ executionStats.total }} 次</span>
              </div>
              <el-progress 
                :percentage="executionStats.passRate" 
                :format="percentageFormat"
                :color="getProgressColor"
                :stroke-width="15"
              />
              <div class="stats-details">
                <div class="stats-item success">
                  <span class="stats-label">通过:</span>
                  <span class="stats-value">{{ executionStats.pass }}</span>
                </div>
                <div class="stats-item danger">
                  <span class="stats-label">失败:</span>
                  <span class="stats-value">{{ executionStats.fail }}</span>
                </div>
                <div class="stats-item warning">
                  <span class="stats-label">阻塞:</span>
                  <span class="stats-value">{{ executionStats.blocked }}</span>
                </div>
                <div class="stats-item info">
                  <span class="stats-label">跳过:</span>
                  <span class="stats-value">{{ executionStats.skipped }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-stats">无执行记录</div>
          </div>
          
          <el-divider />
          
          <div class="related-cases">
            <h4>关联测试用例</h4>
            <div v-if="relatedTestCases.length > 0">
              <div 
                v-for="(relatedCase, index) in relatedTestCases" 
                :key="index"
                class="related-case-item"
                @click="viewRelatedCase(relatedCase)"
              >
                <div class="related-case-id">{{ relatedCase.id }}</div>
                <div class="related-case-name">{{ relatedCase.name }}</div>
                <el-tag size="mini" :type="getRelationTypeColor(relatedCase.relationType)">
                  {{ getRelationTypeText(relatedCase.relationType) }}
                </el-tag>
              </div>
            </div>
            <div v-else class="no-related-cases">无关联测试用例</div>
            
            <div class="add-related-case">
              <el-button 
                type="dashed" 
                size="small" 
                icon="el-icon-plus"
                @click="showAddRelatedDialog"
              >
                添加关联用例
              </el-button>
            </div>
          </div>
        </el-card>
        
        <el-card class="reviewer-card">
          <div slot="header" class="card-header">
            <span>审阅信息</span>
          </div>
          
          <div v-if="testCase.reviewStatus" class="review-status">
            <div class="review-status-label">审阅状态:</div>
            <el-tag :type="getReviewStatusType(testCase.reviewStatus)">
              {{ getReviewStatusText(testCase.reviewStatus) }}
            </el-tag>
          </div>
          
          <div v-if="testCase.reviewer" class="reviewer-info">
            <div class="reviewer-label">审阅人:</div>
            <div class="reviewer-value">{{ testCase.reviewer }}</div>
          </div>
          
          <div v-if="testCase.reviewTime" class="review-time">
            <div class="review-time-label">审阅时间:</div>
            <div class="review-time-value">{{ testCase.reviewTime }}</div>
          </div>
          
          <div v-if="testCase.reviewComments" class="review-comments">
            <div class="comments-label">审阅意见:</div>
            <div class="comments-value">{{ testCase.reviewComments }}</div>
          </div>
          
          <div v-if="!testCase.reviewStatus || testCase.reviewStatus === 'pending'" class="review-actions">
            <el-button 
              type="primary" 
              size="small" 
              icon="el-icon-check"
              @click="approveTestCase"
              :disabled="!canReview"
            >
              审阅通过
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              icon="el-icon-close"
              @click="rejectTestCase"
              :disabled="!canReview"
            >
              审阅不通过
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <span>确定要删除此测试用例吗？此操作不可恢复！</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete">确定删除</el-button>
      </span>
    </el-dialog>

    <!-- 审阅意见对话框 -->
    <el-dialog
      title="审阅意见"
      :visible.sync="reviewDialogVisible"
      width="40%"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审阅状态">
          <el-radio-group v-model="reviewForm.status">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审阅意见" prop="comments">
          <el-input 
            v-model="reviewForm.comments" 
            type="textarea" 
            :rows="4"
            placeholder="请输入审阅意见"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交审阅</el-button>
      </div>
    </el-dialog>

    <!-- 添加关联用例对话框 -->
    <el-dialog
      title="添加关联测试用例"
      :visible.sync="relatedCaseDialogVisible"
      width="50%"
    >
      <el-form :model="relatedCaseForm" label-width="100px">
        <el-form-item label="关联类型" prop="relationType">
          <el-select v-model="relatedCaseForm.relationType" placeholder="选择关联类型" style="width: 100%">
            <el-option label="前置依赖" value="depends_on" />
            <el-option label="包含" value="includes" />
            <el-option label="相关联" value="related_to" />
            <el-option label="克隆自" value="cloned_from" />
          </el-select>
        </el-form-item>
        <el-form-item label="测试用例" prop="testCaseId">
          <el-select 
            v-model="relatedCaseForm.testCaseId"
            filterable
            remote
            reserve-keyword
            placeholder="输入测试用例ID或名称搜索"
            :remote-method="searchTestCases"
            :loading="searching"
            style="width: 100%"
          >
            <el-option
              v-for="item in searchResults"
              :key="item.id"
              :label="`${item.id} - ${item.name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="relatedCaseForm.notes" 
            type="textarea" 
            :rows="2"
            placeholder="可选，添加关联备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="relatedCaseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRelatedCase">添加关联</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 测试用例详情组件，用于展示测试用例的完整信息和执行历史
 */
export default {
  name: 'TestCaseDetails',
  props: {
    /**
     * 测试用例ID
     */
    caseId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      testCase: {},
      loading: false,
      deleteDialogVisible: false,
      reviewDialogVisible: false,
      relatedCaseDialogVisible: false,
      reviewForm: {
        status: 'approved',
        comments: ''
      },
      relatedCaseForm: {
        relationType: 'related_to',
        testCaseId: '',
        notes: ''
      },
      searchResults: [],
      searching: false,
      // 模拟数据 - 实际应从API获取
      canEdit: true,
      canReview: true
    };
  },
  computed: {
    /**
     * 获取最近的执行历史（最多5条）
     */
    recentHistory() {
      return this.testCase.runHistory 
        ? this.testCase.runHistory.slice(0, 5) 
        : [];
    },
    
    /**
     * 计算执行统计数据
     */
    executionStats() {
      if (!this.testCase.runHistory) {
        return { total: 0, pass: 0, fail: 0, blocked: 0, skipped: 0, passRate: 0 };
      }
      
      const history = this.testCase.runHistory;
      const total = history.length;
      const pass = history.filter(h => h.result === '通过').length;
      const fail = history.filter(h => h.result === '失败').length;
      const blocked = history.filter(h => h.result === '阻塞').length;
      const skipped = history.filter(h => h.result === '跳过').length;
      const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
      
      return { total, pass, fail, blocked, skipped, passRate };
    },
    
    /**
     * 获取关联的测试用例
     */
    relatedTestCases() {
      return this.testCase.relatedCases || [];
    }
  },
  created() {
    this.fetchTestCaseDetails();
  },
  methods: {
    /**
     * 获取测试用例详情
     */
    fetchTestCaseDetails() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.testCase = this.generateMockTestCaseDetails();
        this.loading = false;
      }, 600);
    },
    
    /**
     * 处理编辑按钮点击
     */
    handleEdit() {
      this.$emit('edit', this.testCase);
    },
    
    /**
     * 处理执行按钮点击
     */
    handleExecute() {
      this.$emit('execute', this.testCase);
    },
    
    /**
     * 处理克隆按钮点击
     */
    handleClone() {
      this.$confirm('确定要克隆此测试用例吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        // 模拟克隆操作
        setTimeout(() => {
          this.$message.success('测试用例克隆成功');
          
          // 创建一个克隆后的测试用例ID
          const clonedId = `${this.testCase.id}_clone`;
          
          // 跳转到克隆后的测试用例
          this.$emit('view-test-case', clonedId);
        }, 500);
      }).catch(() => {
        // 取消克隆
      });
    },
    
    /**
     * 处理删除按钮点击
     */
    handleDelete() {
      this.deleteDialogVisible = true;
    },
    
    /**
     * 确认删除测试用例
     */
    confirmDelete() {
      this.deleteDialogVisible = false;
      
      // 模拟删除操作
      setTimeout(() => {
        this.$message.success('测试用例已删除');
        this.$emit('deleted', this.testCase.id);
      }, 500);
    },
    
    /**
     * 查看全部执行历史
     */
    viewAllHistory() {
      this.$emit('view-history', this.testCase.id);
    },
    
    /**
     * 查看执行详情
     */
    viewRunDetail(runHistory) {
      this.$emit('view-run-detail', { testCaseId: this.testCase.id, runHistory });
    },
    
    /**
     * 打开缺陷链接
     */
    openBugLink(link) {
      if (link) {
        window.open(link, '_blank');
      }
    },
    
    /**
     * 查看附件
     */
    viewAttachment(file) {
      // 实际应用中应实现附件预览功能
      this.$message.info(`查看附件: ${file.name}`);
    },
    
    /**
     * 查看关联需求
     */
    viewRequirement(reqId) {
      // 实际应用中应跳转到需求详情页
      this.$message.info(`查看需求: ${reqId}`);
    },
    
    /**
     * 查看关联测试用例
     */
    viewRelatedCase(relatedCase) {
      this.$emit('view-test-case', relatedCase.id);
    },
    
    /**
     * 显示添加关联用例对话框
     */
    showAddRelatedDialog() {
      this.relatedCaseForm = {
        relationType: 'related_to',
        testCaseId: '',
        notes: ''
      };
      this.searchResults = [];
      this.relatedCaseDialogVisible = true;
    },
    
    /**
     * 搜索测试用例
     */
    searchTestCases(query) {
      if (query.length < 2) return;
      
      this.searching = true;
      
      // 模拟API搜索调用
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.searchResults = Array.from({ length: 5 }, (_, i) => ({
          id: `TC${1000 + i}`,
          name: `搜索结果: ${query} 测试用例 ${i + 1}`
        }));
        this.searching = false;
      }, 500);
    },
    
    /**
     * 添加关联测试用例
     */
    addRelatedCase() {
      if (!this.relatedCaseForm.testCaseId) {
        this.$message.warning('请选择要关联的测试用例');
        return;
      }
      
      // 模拟API调用添加关联
      setTimeout(() => {
        // 这里应该是真实的API调用
        const newRelatedCase = {
          id: this.relatedCaseForm.testCaseId,
          name: this.searchResults.find(item => item.id === this.relatedCaseForm.testCaseId)?.name || '关联测试用例',
          relationType: this.relatedCaseForm.relationType,
          notes: this.relatedCaseForm.notes
        };
        
        // 添加到关联列表
        if (!this.testCase.relatedCases) {
          this.testCase.relatedCases = [];
        }
        this.testCase.relatedCases.push(newRelatedCase);
        
        this.$message.success('关联测试用例添加成功');
        this.relatedCaseDialogVisible = false;
      }, 500);
    },
    
    /**
     * 审阅通过测试用例
     */
    approveTestCase() {
      this.reviewForm.status = 'approved';
      this.reviewForm.comments = '';
      this.reviewDialogVisible = true;
    },
    
    /**
     * 审阅不通过测试用例
     */
    rejectTestCase() {
      this.reviewForm.status = 'rejected';
      this.reviewForm.comments = '';
      this.reviewDialogVisible = true;
    },
    
    /**
     * 提交审阅
     */
    submitReview() {
      if (this.reviewForm.status === 'rejected' && !this.reviewForm.comments.trim()) {
        this.$message.warning('审阅不通过时需要提供审阅意见');
        return;
      }
      
      // 模拟API调用提交审阅
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.testCase.reviewStatus = this.reviewForm.status;
        this.testCase.reviewer = '当前用户'; // 实际应用中应获取当前登录用户
        this.testCase.reviewTime = new Date().toLocaleString('zh-CN');
        this.testCase.reviewComments = this.reviewForm.comments;
        
        this.$message.success('审阅意见提交成功');
        this.reviewDialogVisible = false;
      }, 500);
    },
    
    /**
     * 格式化文件大小
     */
    formatFileSize(size) {
      if (size < 1024) {
        return size + 'B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + 'KB';
      } else {
        return (size / (1024 * 1024)).toFixed(1) + 'MB';
      }
    },
    
    /**
     * 解析需求列表
     */
    getRequirementsList(requirementsStr) {
      if (!requirementsStr) return [];
      return requirementsStr.split(',').map(item => item.trim());
    },
    
    /**
     * 获取分类类型样式
     */
    getCategoryType(category) {
      const typeMap = {
        '功能测试': '',
        '性能测试': 'success',
        '接口测试': 'warning',
        '安全测试': 'danger',
        '兼容性测试': 'info'
      };
      return typeMap[category] || '';
    },
    
    /**
     * 获取优先级标签类型
     */
    getPriorityType(priority) {
      const typeMap = {
        'P0': 'danger',
        'P1': 'warning',
        'P2': 'success',
        'P3': 'info'
      };
      return typeMap[priority] || '';
    },
    
    /**
     * 获取状态标签类型
     */
    getStatusType(status) {
      const typeMap = {
        'active': 'success',
        'deprecated': 'info',
        'draft': 'warning'
      };
      return typeMap[status] || '';
    },
    
    /**
     * 获取状态显示文本
     */
    getStatusText(status) {
      const textMap = {
        'active': '活跃',
        'deprecated': '废弃',
        'draft': '草稿'
      };
      return textMap[status] || status;
    },
    
    /**
     * 获取结果标签类型
     */
    getResultType(result) {
      const typeMap = {
        '通过': 'success',
        '失败': 'danger',
        '阻塞': 'warning',
        '跳过': 'info'
      };
      return typeMap[result] || '';
    },
    
    /**
     * 获取结果时间线类型
     */
    getResultTimelineType(result) {
      const typeMap = {
        '通过': 'success',
        '失败': 'danger',
        '阻塞': 'warning',
        '跳过': 'info'
      };
      return typeMap[result] || 'primary';
    },
    
    /**
     * 获取结果时间线颜色
     */
    getResultTimelineColor(result) {
      const colorMap = {
        '通过': '#67C23A',
        '失败': '#F56C6C',
        '阻塞': '#E6A23C',
        '跳过': '#909399'
      };
      return colorMap[result] || '';
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
     * 格式化百分比
     */
    percentageFormat(percentage) {
      return `${percentage}%`;
    },
    
    /**
     * 获取进度条颜色
     */
    getProgressColor(percentage) {
      if (percentage < 50) {
        return '#F56C6C';
      } else if (percentage < 80) {
        return '#E6A23C';
      } else {
        return '#67C23A';
      }
    },
    
    /**
     * 获取关联类型颜色
     */
    getRelationTypeColor(type) {
      const colorMap = {
        'depends_on': 'danger',
        'includes': 'primary',
        'related_to': 'info',
        'cloned_from': 'warning'
      };
      return colorMap[type] || '';
    },
    
    /**
     * 获取关联类型文本
     */
    getRelationTypeText(type) {
      const textMap = {
        'depends_on': '前置依赖',
        'includes': '包含',
        'related_to': '相关联',
        'cloned_from': '克隆自'
      };
      return textMap[type] || type;
    },
    
    /**
     * 获取审阅状态类型
     */
    getReviewStatusType(status) {
      const typeMap = {
        'approved': 'success',
        'rejected': 'danger',
        'pending': 'warning'
      };
      return typeMap[status] || 'info';
    },
    
    /**
     * 获取审阅状态文本
     */
    getReviewStatusText(status) {
      const textMap = {
        'approved': '已通过',
        'rejected': '未通过',
        'pending': '待审阅'
      };
      return textMap[status] || '未审阅';
    },
    
    /**
     * 生成模拟测试用例详情数据
     */
    generateMockTestCaseDetails() {
      // 测试步骤
      const steps = [
        { stepNumber: 1, action: '登录系统，使用有效的用户名和密码', expectedResult: '成功登录并进入系统首页' },
        { stepNumber: 2, action: '点击顶部导航栏的"用户管理"菜单', expectedResult: '显示用户管理页面，包含用户列表' },
        { stepNumber: 3, action: '点击"添加用户"按钮', expectedResult: '弹出添加用户表单对话框' },
        { stepNumber: 4, action: '填写必填字段：用户名、密码、邮箱，然后点击"保存"按钮', expectedResult: '表单提交成功，显示成功提示，新用户出现在用户列表中' },
        { stepNumber: 5, action: '在用户列表中找到刚添加的用户，点击"编辑"按钮', expectedResult: '弹出编辑用户表单，填充了用户现有信息' },
        { stepNumber: 6, action: '修改用户邮箱地址，点击"保存"按钮', expectedResult: '表单提交成功，用户信息更新，列表中显示更新后的邮箱地址' },
        { stepNumber: 7, action: '退出系统，使用修改后的用户信息重新登录', expectedResult: '成功登录系统' }
      ];
      
      // 执行历史
      const results = ['通过', '失败', '阻塞', '跳过'];
      const environments = ['development', 'testing', 'staging', 'production'];
      const executors = ['张测试', '李工程师', '王测试', '赵经理'];
      
      const runHistory = Array.from({ length: 8 }, (_, i) => {
        // 创建日期，从近到远
        const date = new Date();
        date.setDate(date.getDate() - i * 5);
        
        // 随机结果，但确保最近的一次是固定的，以便与lastRunResult匹配
        const result = i === 0 ? '通过' : results[Math.floor(Math.random() * results.length)];
        
        return {
          runId: `RUN${1000 + i}`,
          runTime: date.toLocaleString('zh-CN'),
          result,
          executor: executors[Math.floor(Math.random() * executors.length)],
          environment: environments[Math.floor(Math.random() * environments.length)],
          notes: result === '失败' ? '发现某些功能无法正常工作' : 
                 result === '阻塞' ? '测试环境不可用' : 
                 result === '跳过' ? '根据优先级调整暂时跳过' : '测试顺利完成',
          bugLink: result === '失败' ? 'https://example.com/bug/BUG-123' : null
        };
      });
      
      // 关联测试用例
      const relatedCases = [
        {
          id: 'TC1002',
          name: '用户权限验证测试',
          relationType: 'related_to',
          notes: '验证新建用户的权限设置是否生效'
        },
        {
          id: 'TC1005',
          name: '用户登录安全测试',
          relationType: 'depends_on',
          notes: '该测试用例依赖用户登录功能'
        }
      ];
      
      // 附件
      const attachments = [
        {
          name: '测试用例截图.png',
          size: 256 * 1024, // 256KB
          url: '#'
        },
        {
          name: '测试数据集.xlsx',
          size: 1.5 * 1024 * 1024, // 1.5MB
          url: '#'
        }
      ];
      
      // 标签
      const tags = ['用户管理', '核心功能', 'UI测试', '回归测试'];
      
      return {
        id: this.caseId,
        name: '用户管理 - 添加和编辑用户功能测试',
        category: '功能测试',
        priority: 'P1',
        status: 'active',
        module: '用户管理',
        description: '验证系统用户管理模块中添加新用户和编辑现有用户的功能是否正常工作，包括表单验证、数据保存和界面反馈。',
        preconditions: '1. 测试人员已有管理员权限账号\n2. 系统环境正常运行\n3. 测试数据库已准备好',
        testEnvironment: '浏览器：Chrome 90+, Firefox 85+\n操作系统：Windows 10, MacOS\n分辨率：1920x1080及以上',
        estimatedDuration: 15,
        relatedRequirements: 'REQ-101, REQ-102, REQ-105',
        creator: '张测试',
        createdAt: '2023-03-15 14:30:00',
        lastModifiedBy: '李工程师',
        lastModifiedAt: '2023-04-10 09:15:00',
        lastRunResult: '通过',
        lastRunTime: runHistory[0]?.runTime,
        steps,
        runHistory,
        relatedCases,
        attachments,
        tags,
        notes: '该测试用例优先级较高，需在每次迭代发布前执行。如遇到问题，请及时反馈给开发团队。',
        reviewStatus: 'approved',
        reviewer: '赵经理',
        reviewTime: '2023-03-16 10:20:00',
        reviewComments: '测试用例设计合理，步骤详细，通过审阅。'
      };
    }
  }
}
</script>

<style scoped>
.test-case-details {
  padding: 20px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.case-id-tag {
  margin-right: 15px;
  font-size: 14px;
  padding: 6px 10px;
}

.case-title {
  margin: 0;
  font-size: 20px;
}

.details-content {
  margin-top: 20px;
}

.main-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.info-badges {
  display: flex;
  gap: 10px;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
  margin: 20px 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #ebeef5;
}

.description-content, .preconditions-content, .notes-content {
  white-space: pre-line;
  line-height: 1.6;
  color: #606266;
  margin-bottom: 15px;
}

.steps-table {
  margin-bottom: 20px;
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.attachment-item {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 8px 15px;
  background-color: #F5F7FA;
}

.file-size {
  color: #909399;
  font-size: 0.9em;
  margin-left: 5px;
}

.requirement-tag {
  margin-right: 10px;
  margin-bottom: 5px;
  cursor: pointer;
}

.case-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.history-card {
  margin-top: 20px;
}

.history-item-card {
  margin-bottom: 10px;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.history-executor {
  color: #606266;
}

.history-environment {
  color: #606266;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.history-notes {
  color: #606266;
  margin: 5px 0;
  font-size: 0.9em;
}

.history-actions {
  margin-top: 8px;
}

.status-card {
  margin-bottom: 20px;
}

.status-summary {
  padding: 10px 0;
}

.last-result, .last-run-time {
  margin-bottom: 15px;
}

.summary-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.summary-value {
  font-size: 16px;
}

.summary-value.no-data {
  color: #909399;
}

.execution-stats {
  padding: 10px 0;
}

.execution-stats h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stats-details {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  gap: 10px;
}

.stats-item {
  flex: 1;
  min-width: 100px;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}

.stats-item.success {
  background-color: rgba(103, 194, 58, 0.1);
}

.stats-item.danger {
  background-color: rgba(245, 108, 108, 0.1);
}

.stats-item.warning {
  background-color: rgba(230, 162, 60, 0.1);
}

.stats-item.info {
  background-color: rgba(144, 147, 153, 0.1);
}

.stats-label {
  font-size: 0.8em;
  color: #606266;
}

.stats-value {
  font-weight: bold;
  font-size: 1.1em;
}

.no-stats {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}

.related-cases {
  padding: 10px 0;
}

.related-cases h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.related-case-item {
  padding: 10px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.related-case-item:hover {
  background-color: #F5F7FA;
}

.related-case-id {
  font-weight: bold;
  margin-bottom: 5px;
}

.related-case-name {
  margin-bottom: 8px;
  color: #606266;
}

.no-related-cases {
  color: #909399;
  text-align: center;
  padding: 10px 0;
}

.add-related-case {
  margin-top: 15px;
  text-align: center;
}

.reviewer-card {
  margin-top: 20px;
}

.review-status, .reviewer-info, .review-time {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.review-status-label, .reviewer-label, .review-time-label {
  width: 80px;
  font-weight: bold;
  color: #606266;
}

.reviewer-value, .review-time-value {
  color: #606266;
}

.review-comments {
  margin-top: 15px;
}

.comments-label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}

.comments-value {
  white-space: pre-line;
  line-height: 1.5;
  color: #606266;
  background-color: #F5F7FA;
  padding: 10px;
  border-radius: 4px;
}

.review-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}
</style>