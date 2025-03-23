<template>
  <div class="test-case-form">
    <el-form 
      ref="form" 
      :model="form" 
      :rules="rules" 
      label-width="100px"
      label-position="right"
      status-icon
    >
      <el-form-item label="用例名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入测试用例名称" />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="分类" prop="category">
            <el-select 
              v-model="form.category" 
              placeholder="选择测试用例分类" 
              style="width: 100%"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="选择优先级" style="width: 100%">
              <el-option label="P0 - 阻断性" value="P0">
                <span style="color: #F56C6C">P0 - 阻断性</span>
              </el-option>
              <el-option label="P1 - 严重" value="P1">
                <span style="color: #E6A23C">P1 - 严重</span>
              </el-option>
              <el-option label="P2 - 一般" value="P2">
                <span style="color: #67C23A">P2 - 一般</span>
              </el-option>
              <el-option label="P3 - 次要" value="P3">
                <span style="color: #909399">P3 - 次要</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option label="活跃" value="active" />
              <el-option label="草稿" value="draft" />
              <el-option label="废弃" value="deprecated" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3" 
          placeholder="请详细描述测试用例的目的和范围"
        />
      </el-form-item>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="前置条件" prop="preconditions">
            <el-input 
              v-model="form.preconditions" 
              type="textarea" 
              :rows="3" 
              placeholder="测试执行前必须满足的条件"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="测试环境" prop="testEnvironment">
            <el-input 
              v-model="form.testEnvironment" 
              type="textarea" 
              :rows="3" 
              placeholder="测试用例执行的环境要求"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联需求" prop="relatedRequirements">
            <el-input 
              v-model="form.relatedRequirements" 
              placeholder="输入关联的需求ID或链接"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="预计时间" prop="estimatedDuration">
            <el-input-number 
              v-model="form.estimatedDuration" 
              :min="1" 
              :max="180" 
              style="width: 180px"
            />
            <span style="margin-left: 10px">分钟</span>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider content-position="left">测试步骤</el-divider>
      
      <el-form-item>
        <div class="test-steps-container">
          <div v-for="(step, index) in form.steps" :key="index" class="test-step-item">
            <div class="step-header">
              <span class="step-number">步骤 {{ step.stepNumber }}</span>
              <el-button 
                type="danger" 
                icon="el-icon-delete" 
                size="mini" 
                circle 
                @click="removeStep(index)"
                :disabled="form.steps.length <= 1"
              />
            </div>
            
            <el-row :gutter="10">
              <el-col :span="11">
                <el-form-item 
                  :label="'操作'"
                  :prop="`steps.${index}.action`"
                  :rules="[{ required: true, message: '操作步骤不能为空', trigger: 'blur' }]"
                  label-width="50px"
                >
                  <el-input 
                    v-model="step.action" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="详细描述操作步骤"
                  />
                </el-form-item>
              </el-col>
              
              <el-col :span="11">
                <el-form-item 
                  :label="'预期'"
                  :prop="`steps.${index}.expectedResult`"
                  :rules="[{ required: true, message: '预期结果不能为空', trigger: 'blur' }]"
                  label-width="50px"
                >
                  <el-input 
                    v-model="step.expectedResult" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="详细描述预期结果"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <div class="add-step-btn">
            <el-button type="primary" icon="el-icon-plus" @click="addStep">添加步骤</el-button>
          </div>
        </div>
      </el-form-item>
      
      <el-divider content-position="left">附加信息</el-divider>
      
      <el-form-item label="附件">
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleAttachmentChange"
          :file-list="form.attachments"
          multiple
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">可上传任何与测试用例相关的文档或图片</div>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="标签">
        <el-tag
          :key="tag"
          v-for="tag in form.tags"
          closable
          :disable-transitions="false"
          @close="removeTag(tag)"
          style="margin-right: 10px; margin-bottom: 5px"
        >
          {{ tag }}
        </el-tag>
        
        <el-input
          class="input-new-tag"
          v-if="inputTagVisible"
          v-model="inputTagValue"
          ref="tagInput"
          size="small"
          @keyup.enter.native="confirmTag"
          @blur="confirmTag"
          style="width: 90px"
        />
        
        <el-button v-else class="button-new-tag" size="small" @click="showTagInput">+ 添加标签</el-button>
      </el-form-item>
      
      <el-form-item label="备注">
        <el-input 
          v-model="form.notes" 
          type="textarea" 
          :rows="2" 
          placeholder="其他补充说明或备注信息"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">{{ isEdit ? '保存修改' : '创建用例' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button v-if="isEdit" type="danger" @click="confirmDelete">删除用例</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <span>确定要删除此测试用例吗？此操作不可恢复！</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="deleteTestCase">确定删除</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 测试用例表单组件，用于创建或编辑测试用例
 */
export default {
  name: 'TestCaseForm',
  props: {
    /**
     * 是否为编辑模式
     */
    isEdit: {
      type: Boolean,
      default: false
    },
    /**
     * 编辑模式下传入的测试用例数据
     */
    testCaseData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        name: '',
        category: '',
        priority: 'P2',
        status: 'active',
        description: '',
        preconditions: '',
        testEnvironment: '',
        relatedRequirements: '',
        estimatedDuration: 15,
        steps: [
          { stepNumber: 1, action: '', expectedResult: '' }
        ],
        attachments: [],
        tags: [],
        notes: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入测试用例名称', trigger: 'blur' },
          { min: 3, max: 100, message: '长度应为3到100个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择测试用例分类', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入测试用例描述', trigger: 'blur' }
        ]
      },
      categoryOptions: [
        { value: '功能测试', label: '功能测试' },
        { value: '性能测试', label: '性能测试' },
        { value: '接口测试', label: '接口测试' },
        { value: '安全测试', label: '安全测试' },
        { value: '兼容性测试', label: '兼容性测试' },
        { value: '回归测试', label: '回归测试' }
      ],
      submitting: false,
      deleteDialogVisible: false,
      inputTagVisible: false,
      inputTagValue: ''
    };
  },
  created() {
    if (this.isEdit && this.testCaseData) {
      this.initFormData();
    }
  },
  methods: {
    /**
     * 初始化表单数据（编辑模式）
     */
    initFormData() {
      // 复制传入的测试用例数据到表单
      this.form = { ...this.testCaseData };
      
      // 确保步骤数据格式正确
      if (!this.form.steps || this.form.steps.length === 0) {
        this.form.steps = [{ stepNumber: 1, action: '', expectedResult: '' }];
      }
      
      // 确保标签为数组
      if (!this.form.tags) {
        this.form.tags = [];
      }
      
      // 确保附件为数组
      if (!this.form.attachments) {
        this.form.attachments = [];
      }
    },
    
    /**
     * 添加测试步骤
     */
    addStep() {
      const newStepNumber = this.form.steps.length + 1;
      this.form.steps.push({
        stepNumber: newStepNumber,
        action: '',
        expectedResult: ''
      });
    },
    
    /**
     * 移除测试步骤
     */
    removeStep(index) {
      if (this.form.steps.length > 1) {
        this.form.steps.splice(index, 1);
        
        // 重新编号
        this.form.steps.forEach((step, i) => {
          step.stepNumber = i + 1;
        });
      }
    },
    
    /**
     * 处理附件变化
     */
    handleAttachmentChange(file, fileList) {
      this.form.attachments = fileList;
    },
    
    /**
     * 显示标签输入框
     */
    showTagInput() {
      this.inputTagVisible = true;
      this.$nextTick(() => {
        this.$refs.tagInput.$refs.input.focus();
      });
    },
    
    /**
     * 确认添加标签
     */
    confirmTag() {
      const inputValue = this.inputTagValue.trim();
      if (inputValue && !this.form.tags.includes(inputValue)) {
        this.form.tags.push(inputValue);
      }
      this.inputTagVisible = false;
      this.inputTagValue = '';
    },
    
    /**
     * 移除标签
     */
    removeTag(tag) {
      const index = this.form.tags.indexOf(tag);
      if (index !== -1) {
        this.form.tags.splice(index, 1);
      }
    },
    
    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitting = true;
          
          // 确保所有步骤都有内容
          const hasEmptySteps = this.form.steps.some(
            step => !step.action.trim() || !step.expectedResult.trim()
          );
          
          if (hasEmptySteps) {
            this.$message.error('请完善所有测试步骤的内容');
            this.submitting = false;
            return;
          }
          
          // 模拟API调用保存测试用例
          setTimeout(() => {
            if (this.isEdit) {
              this.$emit('test-case-updated', { ...this.form });
              this.$message.success('测试用例已更新');
            } else {
              // 添加创建信息
              const newTestCase = {
                ...this.form,
                id: new Date().getTime().toString().slice(-4),
                creator: '当前用户', // 实际应用中应获取当前登录用户
                createdAt: new Date().toLocaleString('zh-CN')
              };
              this.$emit('test-case-created', newTestCase);
              this.$message.success('测试用例已创建');
              this.resetForm();
            }
            
            this.submitting = false;
          }, 1000);
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
      this.$refs.form.resetFields();
      
      // 重置为默认值
      if (!this.isEdit) {
        this.form = {
          name: '',
          category: '',
          priority: 'P2',
          status: 'active',
          description: '',
          preconditions: '',
          testEnvironment: '',
          relatedRequirements: '',
          estimatedDuration: 15,
          steps: [
            { stepNumber: 1, action: '', expectedResult: '' }
          ],
          attachments: [],
          tags: [],
          notes: ''
        };
      }
    },
    
        /**
     * 删除测试用例
     */
    deleteTestCase() {
      this.deleteDialogVisible = false;
      
      // 模拟API调用删除测试用例
      setTimeout(() => {
        this.$emit('test-case-deleted', this.form.id);
        this.$message.success('测试用例已删除');
      }, 500);
    }
  }
}
</script>

<style scoped>
.test-case-form {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-steps-container {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.test-step-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.step-number {
  font-weight: bold;
  color: #409EFF;
}

.add-step-btn {
  text-align: center;
  margin-top: 15px;
}

.input-new-tag {
  width: 90px;
  margin-right: 10px;
  vertical-align: bottom;
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>