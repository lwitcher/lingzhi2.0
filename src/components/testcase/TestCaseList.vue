<template>
  <div class="test-case-list">
    <div class="list-header">
      <h2>测试用例库</h2>
      <div class="header-actions">
        <el-button 
          type="success" 
          @click="showImportDialog"
        >
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button 
          type="info" 
          @click="exportSelectedCases"
          :disabled="selectedCases.length === 0"
        >
          <el-icon><Download /></el-icon>
          导出选中 ({{ selectedCases.length }})
        </el-button>
      </div>
    </div>

    <div class="filter-section">
  <el-row :gutter="20">
    <el-col :span="4">
      <el-input
        v-model="filterForm.keyword"
        placeholder="搜索测试用例..."
        clearable
        @input="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-col>
    
    <el-col :span="4">
      <el-select 
        v-model="filterForm.category" 
        placeholder="分类筛选" 
        @change="handleFilter"
        style="width: 100%"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-col>
    
    <el-col :span="4">
      <el-select 
        v-model="filterForm.module" 
        placeholder="模块筛选" 
        @change="handleFilter"
        style="width: 100%"
      >
        <el-option
          v-for="item in moduleOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-col>
    
    <el-col :span="4">
      <el-select 
        v-model="filterForm.businessFunction" 
        placeholder="业务功能筛选" 
        @change="handleFilter"
        style="width: 100%"
      >
        <el-option
          v-for="item in businessFunctionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-col>
    
    <el-col :span="4">
      <el-input
        v-model="filterForm.project"
        placeholder="搜索引入项目"
        clearable
        @input="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </el-col>
    
    <el-col :span="4">
      <el-button 
        type="text" 
        @click="resetFilter"
        style="width: 100%"
      >
        <el-icon><RefreshRight /></el-icon>
        重置筛选
      </el-button>
    </el-col>
  </el-row>
</div>

    <el-table
      ref="testCaseTable"
      v-loading="loading"
      :data="pagedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="id" label="ID" width="80" />
      
      <el-table-column prop="name" label="用例名称" min-width="200">
        <template #default="scope">
          <a 
            v-if="scope && scope.row" 
            href="javascript:;" 
            class="test-case-link" 
            @click="showDetail(scope.row)"
          >
            {{ scope.row?.name || '无名称' }}
          </a>
          <span v-else>无名称</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="module" label="模块" width="90">
  <template #default="scope">
    <el-tag 
      v-if="scope && scope.row" 
      :type="getModuleType(scope.row?.module)" 
      size="small"
    >
      {{ scope.row?.module || '其他' }}
    </el-tag>
    <el-tag v-else size="small" type="info">其他</el-tag>
  </template>
</el-table-column>
      
<el-table-column prop="businessFunction" label="业务功能" width="120">
  <template #default="scope">
    <el-tag 
      v-if="scope && scope.row" 
      :type="getBusinessFunctionType(scope.row?.businessFunction)" 
      size="small"
    >
      {{ scope.row?.businessFunction || '其他' }}
    </el-tag>
    <el-tag v-else size="small" type="info">其他</el-tag>
  </template>
</el-table-column>
<el-table-column prop="project" label="引入项目" width="120">
  <template #default="scope">
    {{ scope.row?.project || '-' }}
  </template>
</el-table-column>
      <el-table-column prop="lastRunResult" label="上次执行" width="100">
        <template #default="scope">
          <el-tag 
            v-if="scope && scope.row && scope.row.lastRunResult" 
            :type="getResultType(scope.row.lastRunResult)" 
            size="small"
          >
            {{ scope.row.lastRunResult }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdAt" label="创建时间" width="160" />
      
      <el-table-column prop="creator" label="创建人" width="120">
        <template #default="scope">
          {{ scope && scope.row ? (scope.row.creator || '-') : '-' }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div v-if="scope && scope.row" class="operation-buttons">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="showDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            
            <el-button 
              size="small" 
              type="success" 
              plain
              @click="runTest(scope.row)"
            >
              <el-icon><Timer /></el-icon>
              执行
            </el-button>
            
            <el-dropdown trigger="click" @command="handleCommand($event, scope.row)">
              <el-button size="small" type="info" plain>
                <el-icon><More /></el-icon>
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon> 编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">
                    <el-icon><DocumentCopy /></el-icon> 复制
                  </el-dropdown-item>
                  <el-dropdown-item command="history">
                    <el-icon><Document /></el-icon> 历史
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-else>
            <el-button size="mini" type="info" disabled>加载中</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="filteredTestCases.length === 0 && !loading" class="no-data">
      <el-empty description="暂无测试用例"></el-empty>
    </div>

    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTestCases"
      />
    </div>

    <!-- 测试用例详情对话框 -->
    <el-dialog
      title="测试用例详情"
      :visible.sync="detailDialogVisible"
      width="70%"
      top="5vh"
    >
      <div v-if="currentTestCase" class="test-case-detail">
        <el-descriptions border :column="2">
          <el-descriptions-item label="用例ID">{{ currentTestCase.id }}</el-descriptions-item>
          <el-descriptions-item label="用例名称">{{ currentTestCase.name }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ currentTestCase.category }}</el-descriptions-item>
          <el-descriptions-item label="模块">
            <el-tag :type="getModuleType(currentTestCase.module)">
              {{ currentTestCase.module }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业务功能">
            <el-tag :type="getBusinessFunctionType(currentTestCase.businessFunction)">
              {{ currentTestCase.businessFunction }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTestCase.status)">
              {{ getStatusText(currentTestCase.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最近执行结果">
            <el-tag 
              v-if="currentTestCase.lastRunResult" 
              :type="getResultType(currentTestCase.lastRunResult)"
            >
              {{ currentTestCase.lastRunResult }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentTestCase.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTestCase.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="最近执行时间">{{ currentTestCase.lastRunTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="预计执行时间">{{ currentTestCase.estimatedDuration || '-' }} 分钟</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentTestCase.description }}</el-descriptions-item>
          <el-descriptions-item label="前置条件" :span="2">{{ currentTestCase.preconditions || '无' }}</el-descriptions-item>
          <el-descriptions-item label="关联需求" :span="2">{{ currentTestCase.relatedRequirements || '无' }}</el-descriptions-item>
          <el-descriptions-item label="测试环境" :span="2">{{ currentTestCase.testEnvironment || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="test-steps-section">
          <h3>测试步骤</h3>
          <el-table :data="currentTestCase.steps" border style="width: 100%">
            <el-table-column prop="stepNumber" label="步骤" width="80" />
            <el-table-column prop="action" label="操作" min-width="300" />
            <el-table-column prop="expectedResult" label="预期结果" min-width="300" />
          </el-table>
        </div>

        <div class="test-history-section" v-if="currentTestCase.runHistory && currentTestCase.runHistory.length > 0">
          <h3>执行历史</h3>
          <el-table :data="currentTestCase.runHistory" border style="width: 100%">
            <el-table-column prop="runTime" label="执行时间" width="180" />
            <el-table-column prop="result" label="结果" width="120">
              <template #default="scope">
                <el-tag :type="getResultType(scope.row.result)">{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="executor" label="执行人" width="120" />
            <el-table-column prop="environment" label="环境" width="150" />
            <el-table-column prop="notes" label="备注" min-width="200" />
          </el-table>
        </div>

        <div class="dialog-footer" style="margin-top: 20px; text-align: right;">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editTestCase(currentTestCase)">编辑</el-button>
          <el-button type="warning" @click="runTestCase(currentTestCase)">执行</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 导入测试用例对话框 -->
    <el-dialog
      title="导入测试用例"
      :visible.sync="importDialogVisible"
      width="40%"
    >
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="文件格式">
          <el-radio-group v-model="importForm.format">
            <el-radio label="excel">Excel (xlsx)</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="json">JSON</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="上传文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            :file-list="importForm.fileList"
          >
            <el-icon><Upload /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">
              {{ getUploadTipByFormat(importForm.format) }}
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="导入选项">
          <el-checkbox v-model="importForm.overwriteExisting">覆盖已存在的测试用例</el-checkbox>
          <el-checkbox v-model="importForm.skipInvalid">跳过无效数据</el-checkbox>
        </el-form-item>
      </el-form>
      
      <div class="import-templates">
        <p>下载模板：</p>
        <el-link type="primary" @click="downloadTemplate('excel')">Excel模板</el-link>
        <el-link type="primary" @click="downloadTemplate('csv')">CSV模板</el-link>
        <el-link type="primary" @click="downloadTemplate('json')">JSON模板</el-link>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importTestCases" :loading="importing">
          开始导入
        </el-button>
      </div>
    </el-dialog>

    <!-- 测试用例执行对话框 -->
    <el-dialog
      title="执行测试用例"
      :visible.sync="runDialogVisible"
      width="50%"
    >
      <div v-if="currentTestCase" class="run-test-case">
        <h3>{{ currentTestCase.name }}</h3>
        <p class="test-case-description">{{ currentTestCase.description }}</p>
        
        <el-form :model="runForm" label-width="100px" size="small">
          <el-form-item label="测试环境">
            <el-select v-model="runForm.environment" placeholder="选择环境" style="width: 100%">
              <el-option label="开发环境" value="development" />
              <el-option label="测试环境" value="testing" />
              <el-option label="预发环境" value="staging" />
              <el-option label="生产环境" value="production" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="执行人">
            <el-input v-model="runForm.executor" placeholder="请输入执行人"></el-input>
          </el-form-item>
          
          <el-form-item label="执行结果">
            <el-radio-group v-model="runForm.result">
              <el-radio label="通过">通过</el-radio>
              <el-radio label="失败">失败</el-radio>
              <el-radio label="阻塞">阻塞</el-radio>
              <el-radio label="跳过">跳过</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <div class="test-steps-section">
            <h4>测试步骤记录</h4>
            <div v-for="(step, index) in runForm.steps" :key="index" class="test-step">
              <div class="step-header">
                <span>步骤 {{ step.stepNumber }}：{{ step.action }}</span>
              </div>
              
              <el-form-item label="实际结果">
                <el-input v-model="step.actualResult" type="textarea" :rows="2" placeholder="输入实际结果"></el-input>
              </el-form-item>
              
              <el-form-item label="状态">
                <el-radio-group v-model="step.status" size="small">
                  <el-radio-button label="通过">通过</el-radio-button>
                  <el-radio-button label="失败">失败</el-radio-button>
                  <el-radio-button label="跳过">跳过</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
          
          <el-form-item label="备注" v-if="runForm.result !== '通过'">
            <el-input v-model="runForm.notes" type="textarea" :rows="3" placeholder="请输入执行备注或说明"></el-input>
          </el-form-item>
          
          <el-form-item label="关联缺陷链接" v-if="runForm.result === '失败'">
            <el-input v-model="runForm.bugLink" placeholder="缺陷链接或ID"></el-input>
          </el-form-item>
          
          <el-form-item label="附件">
            <el-upload
              action="#"
              :limit="5"
              :auto-upload="false"
              :file-list="runForm.fileList"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="text-center py-4">
        <p>正在加载测试用例信息...</p>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="runDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTestRun" :loading="submittingRun" :disabled="!currentTestCase">
          提交执行记录
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 测试用例列表组件，用于管理和执行测试用例
 */
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  View, 
  Edit, 
  Delete, 
  CopyDocument, 
  Timer, 
  DocumentCopy,
  ArrowDown,
  RefreshRight,
  More
} from '@element-plus/icons-vue';

export default {
  name: 'TestCaseList',
  components: {
    Plus,
    Upload,
    Download,
    Search,
    View,
    Edit,
    Delete,
    CopyDocument,
    Timer,
    DocumentCopy,
    ArrowDown,
    RefreshRight,
    More,
    Document: CopyDocument
  },
  props: {
    /**
     * 外部传入的筛选器
     */
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      testCases: [],
      filteredTestCases: [],
      selectedCases: [],
      loading: true,
      currentTestCase: null,
      detailDialogVisible: false,
      importDialogVisible: false,
      runDialogVisible: false,
      importing: false,
      submittingRun: false,
      
      // 筛选表单
      filterForm: {
      keyword: '',
      category: 'all',
      businessFunction: 'all',
      module: 'all',
      project: '' 
    },
      
      // 分页配置
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 导入表单
      importForm: {
        format: 'excel',
        fileList: [],
        overwriteExisting: false,
        skipInvalid: true
      },
      
      // 执行测试表单
      runForm: {
        environment: 'testing',
        executor: '',
        result: '通过',
        notes: '',
        bugLink: '',
        fileList: [],
        steps: []
      },
      
      // 分类选项
      categoryOptions: [
        { value: 'all', label: '全部分类' },
        { value: '功能测试', label: '功能测试' },
        { value: '性能测试', label: '性能测试' },
        { value: '接口测试', label: '接口测试' },
        { value: '安全测试', label: '安全测试' },
        { value: '对比测试', label: '对比测试' },
        { value: '回归测试', label: '回归测试' }
      ],
      // 模块选项
    moduleOptions: [
      { value: 'all', label: '全部模块' },
      { value: '撮合', label: '撮合' },
      { value: '风控', label: '风控' },
      { value: '行情', label: '行情' },
      { value: '网关', label: '网关' },
      { value: '其他', label: '其他' }
    ],
    businessFunctionOptions: [ // 添加业务功能选项
      { value: 'all', label: '全部业务功能' },
      { value: 'TAS', label: 'TAS' },
      { value: '集合竞价撮合', label: '集合竞价撮合' },
      { value: '持仓风控', label: '持仓风控' },
      { value: '资金风控', label: '资金风控' },
      { value: '行情', label: '行情' }
    ],
    };
  },
  computed: {
    /**
     * 当前页的数据
     * @returns {Array} 当前页的数据数组
     */
    pagedData() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      return this.filteredTestCases.slice(start, end);
    },
    /**
     * 计算总测试用例数量
     */
    totalTestCases() {
      return this.testCases.length;
    }
  },
  created() {
    this.fetchTestCases();
    
    // 如果有传入的筛选器，则应用它们
    if (this.filters) {
      this.filterForm = { ...{
      keyword: '',
      category: 'all',
      businessFunction: 'all',
      module: 'all',
      status: ''
    },
    ...this.filters };
      this.handleFilter();
    }
  },
  methods: {
    getBusinessFunctionType(businessFunction) {
    const map = {
      'TAS': 'success',
      '集合竞价撮合': 'warning',
      '持仓风控': 'primary',
      '资金风控': 'info',
      '行情': 'danger'
    };
    return map[businessFunction] || 'info';
  },
    getModuleType(module) {
    const map = {
      '撮合': 'success',
      '风控': 'warning',
      '行情': 'primary',
      '网关': 'info',
      '其他': 'danger'
    };
    return map[module] || 'info';
  },
    /**
     * 获取测试用例数据
     */
    fetchTestCases() {
      this.loading = true;
      // 模拟API调用
      setTimeout(() => {
        // 生成测试数据
        this.testCases = Array.from({ length: 53 }, (_, i) => {
          const id = `TC-${1000 + i}`;
          const validCategories = this.categoryOptions.filter(opt => opt.value !== 'all');
          const validBusinessFunctions = this.businessFunctionOptions.filter(opt => opt.value !== 'all');
          const validModules = this.moduleOptions.filter(opt => opt.value!== 'all');
          const category = validCategories[Math.floor(Math.random() * validCategories.length)].value;
          const businessFunction = validBusinessFunctions[Math.floor(Math.random() * validBusinessFunctions.length)].value;
          const lastRunResult = Math.random() > 0.3 ? ['通过', '失败', '阻塞', '跳过'][Math.floor(Math.random() * 4)] : null;
          const module = validModules[Math.floor(Math.random() * validModules.length)].value;
          
          return {
            id,
            name: `${id} - ${['下单功能', '持仓风控功能', '资金风控功能', '委托回报功能', '行情发送功能'][Math.floor(Math.random() * 5)]}`,
            module,
            businessFunction,
            description: `这是测试用例 ${id} 的详细描述，用于测试系统功能是否正常运行。`,
            project: ['期权结算价优化', 'TAS', '新一代交易系统'][Math.floor(Math.random() * 3)],
            category,
            creator: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString(),
            lastRunResult,
            lastRunTime: lastRunResult ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toLocaleString() : null,
            tags: ['UI', 'API', '功能', '性能', '安全'].filter(() => Math.random() > 0.7),
            preconditions: '用户已登录系统，并具有必要的权限。',
            steps: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, j) => ({
              stepNumber: j + 1,
              action: `执行步骤 ${j + 1}：点击按钮或输入数据`,
              expectedResult: `期望结果 ${j + 1}：系统应该正确响应操作`
            })),
            testEnvironment: ['开发环境', '测试环境', '预发环境', '生产环境'][Math.floor(Math.random() * 4)],
            estimatedDuration: Math.floor(Math.random() * 30) + 5,
            relatedRequirements: Math.random() > 0.5 ? `REQ-${1000 + Math.floor(Math.random() * 100)}` : null,
            runHistory: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({
              runTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString(),
              executor: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
              environment: ['开发环境', '测试环境', '预发环境', '生产环境'][Math.floor(Math.random() * 4)],
              result: ['通过', '失败', '阻塞', '跳过'][Math.floor(Math.random() * 4)],
              notes: Math.random() > 0.5 ? '测试过程中遇到了一些问题，但最终完成测试。' : ''
            }))
          };
        });
        
        this.loading = false;
        this.applyFilters();
      }, 1000);
    },
    
    /**
     * 应用筛选条件
     */
     applyFilters() {
      const { keyword, category, module, businessFunction, project } = this.filterForm;
    
    this.filteredTestCases = this.testCases.filter(item => {
      // 关键字搜索
      if (keyword && !item.name.includes(keyword) && 
          !item.id.includes(keyword) && 
          !(item.description && item.description.includes(keyword))) {
        return false;
      }

      //模块筛选
      if (module && module !== 'all' && item.module !== module) {
      return false;
    }
      
      // 分类筛选
      if (category && category !== 'all' && item.category !== category) {
        return false;
      }
      
      // 业务功能筛选
      if (businessFunction && businessFunction !== 'all' && item.businessFunction !== businessFunction) {
        return false;
      }
      
      // 项目筛选
    if (project && !item.project.includes(project)) {
      return false;
    }
      
      return true;
    });
    
    // 更新分页总数
    this.pagination.total = this.filteredTestCases.length;
  },
    
    /**
     * 处理筛选条件变化
     */
    handleFilter() {
      this.pagination.currentPage = 1;
      this.applyFilters();
    },
    
    /**
     * 重置筛选条件
     */
    resetFilter() {
      this.filterForm = {
        keyword: '',
        category: 'all',
        businessFunction: 'all',
        module: 'all',
        status: ''
      };
      this.pagination.currentPage = 1;
      this.applyFilters();
    },
    
    /**
     * 处理选择变化
     */
    handleSelectionChange(selection) {
      this.selectedCases = selection;
    },
    
    /**
     * 处理操作命令
     */
    handleCommand(command, row) {
      switch (command) {
        case 'edit':
          this.editTestCase(row);
          break;
        case 'copy':
          this.copyTestCase(row);
          break;
        case 'history':
          this.showHistory(row);
          break;
        case 'delete':
          this.deleteTestCase(row);
          break;
      }
    },
    
    /**
     * 显示测试用例详情
     */
    showDetail(row) {
      this.currentTestCase = row;
      this.detailDialogVisible = true;
    },
    
    /**
     * 编辑测试用例
     */
    editTestCase(row) {
      this.$message.info(`编辑测试用例: ${row?.id || '未知'}`);
      // 这里实际应该跳转到编辑页面或打开编辑对话框
    },
    
    /**
     * 复制测试用例
     */
    copyTestCase(row) {
      this.$message.success(`复制测试用例: ${row?.id || '未知'}`);
      // 实际应用中，应该复制一个新的测试用例并打开编辑
    },
    
    /**
     * 显示测试用例历史记录
     */
    showHistory(row) {
      this.currentTestCase = row;
      this.detailDialogVisible = true;
      // 可以滚动到历史记录部分或打开专门的历史记录对话框
    },
    
    /**
     * 删除测试用例
     */
    deleteTestCase(row) {
      this.$confirm(`确定要删除测试用例 ${row?.id || '未知'} 吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除操作
        this.testCases = this.testCases.filter(item => item.id !== row.id);
        this.applyFilters();
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    /**
     * 执行测试用例
     */
    runTest(row) {
      this.currentTestCase = row;
      this.runForm.steps = row.steps.map(step => ({
        ...step,
        actualResult: '',
        status: '通过'
      }));
      this.runDialogVisible = true;
    },
    
    /**
     * 提交测试运行结果
     */
    submitTestRun() {
      if (!this.currentTestCase) return;
      
      this.submittingRun = true;
      
      // 模拟提交API调用
      setTimeout(() => {
        // 更新测试用例的最后执行结果
        const index = this.testCases.findIndex(item => item.id === this.currentTestCase.id);
        if (index !== -1) {
          this.testCases[index].lastRunResult = this.runForm.result;
          this.testCases[index].lastRunTime = new Date().toLocaleString();
          
          // 添加到执行历史
          if (!this.testCases[index].runHistory) {
            this.testCases[index].runHistory = [];
          }
          
          this.testCases[index].runHistory.unshift({
            runTime: new Date().toLocaleString(),
            executor: this.runForm.executor || '未知',
            environment: this.runForm.environment,
            result: this.runForm.result,
            notes: this.runForm.notes || ''
          });
        }
        
        this.submittingRun = false;
        this.runDialogVisible = false;
        this.$message.success('测试执行记录已提交');
        
        // 重置表单
        this.runForm = {
          environment: 'testing',
          executor: '',
          result: '通过',
          notes: '',
          bugLink: '',
          fileList: [],
          steps: []
        };
        
        // 刷新筛选后的数据
        this.applyFilters();
      }, 1000);
    },
    
    
    /**
     * 获取状态对应的类型
     */
    getStatusType(status) {
      const map = {
        'active': 'success',
        'inactive': 'info',
        'draft': 'warning',
        'deprecated': 'danger'
      };
      return map[status] || 'info';
    },
    
    /**
     * 获取状态对应的文本
     */
    getStatusText(status) {
      const map = {
        'active': '激活',
        'inactive': '未激活',
        'draft': '草稿',
        'deprecated': '废弃'
      };
      return map[status] || status;
    },
    
    /**
     * 获取测试结果对应的类型
     */
    getResultType(result) {
      const map = {
        '通过': 'success',
        '失败': 'danger',
        '阻塞': 'warning',
        '跳过': 'info'
      };
      return map[result] || 'info';
    },
    
    /**
     * 处理页大小变化
     */
    handleSizeChange(size) {
      this.pagination.pageSize = size;
    },
    
    /**
     * 处理页码变化
     */
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
    },
    
    /**
     * 创建新测试用例
     */
    createTestCase() {
      // 在实际应用中，这里应该跳转到创建页面或打开创建对话框
      this.$emit('create-test-case');
    },
    
    /**
     * 显示导入对话框
     */
    showImportDialog() {
      this.importForm = {
        format: 'excel',
        fileList: [],
        overwriteExisting: false,
        skipInvalid: true
      };
      this.importDialogVisible = true;
    },
    
    /**
     * 处理文件变化
     */
    handleFileChange(file) {
      this.importForm.fileList = [file];
    },
    
    /**
     * 处理执行记录文件变化
     */
    handleRunFileChange(file, fileList) {
      this.runForm.fileList = fileList;
    },
    
    /**
     * 根据文件格式获取上传提示
     */
    getUploadTipByFormat(format) {
      const formatMap = {
        'excel': '请上传 .xlsx 格式的测试用例文件，文件大小不超过10MB',
        'csv': '请上传 .csv 格式的测试用例文件，文件大小不超过5MB',
        'json': '请上传 .json 格式的测试用例文件，文件大小不超过10MB'
      };
      return formatMap[format] || '请上传测试用例文件';
    },
    
    /**
     * 下载模板
     */
    downloadTemplate(format) {
      // 实际应用中应下载对应的模板文件
      this.$message.success(`正在下载${format}格式的测试用例模板...`);
      
      // 模拟下载操作
      setTimeout(() => {
        this.$message.success('模板下载成功！');
      }, 1000);
    },
    
    /**
     * 导入测试用例
     */
    importTestCases() {
      if (this.importForm.fileList.length === 0) {
        this.$message.warning('请先选择要导入的文件');
        return;
      }
      
      this.importing = true;
      
      // 模拟导入过程
      setTimeout(() => {
        const importCount = Math.floor(Math.random() * 20) + 5; // 随机导入5-25个测试用例
        
        // 生成导入的测试用例
        const importedCases = Array.from({ length: importCount }, (_, i) => ({
          id: 10000 + this.testCases.length + i,
          name: `导入的测试用例 ${i + 1}`,
          category: this.categoryOptions[Math.floor(Math.random() * this.categoryOptions.length)].value,
          status: 'active',
          description: '这是从文件导入的测试用例',
          creator: '系统导入',
          createdAt: new Date().toLocaleString('zh-CN'),
          steps: [
            { stepNumber: 1, action: '执行测试前置步骤', expectedResult: '前置条件满足' },
            { stepNumber: 2, action: '执行测试操作', expectedResult: '操作成功完成' },
            { stepNumber: 3, action: '验证测试结果', expectedResult: '结果符合预期' }
          ]
        }));
        
        // 添加到测试用例列表
        this.testCases = [...this.testCases, ...importedCases];
        this.applyFilters();
        
        this.$message.success(`成功导入 ${importCount} 个测试用例`);
        this.importDialogVisible = false;
        this.importing = false;
      }, 2000);
    },
    
    /**
     * 导出选中的测试用例
     */
    exportSelectedCases() {
      if (this.selectedCases.length === 0) {
        this.$message.warning('请先选择要导出的测试用例');
        return;
      }
      
      this.$message.success(`正在导出 ${this.selectedCases.length} 个测试用例...`);
      
      // 模拟导出过程
      setTimeout(() => {
        this.$message.success('测试用例导出成功！');
      }, 1500);
    }
  }
}
</script>

<style scoped>
.test-case-list {
  padding: 20px;
  height: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 确保按钮文字垂直居中 */
.header-actions .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-section {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

/* 操作按钮组样式 */
.operation-buttons {
  display: flex;
  gap: 5px;
  align-items: center;
}

/* 表格中的按钮样式 */
.operation-buttons .el-button {
  padding: 4px 8px !important;
  height: 24px !important;
  line-height: 1 !important;
  font-size: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 表格中的下拉菜单按钮 */
.operation-buttons .el-dropdown .el-button {
  padding: 4px 8px !important;
  height: 24px !important;
  line-height: 1 !important;
  font-size: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 表格中按钮的图标样式 */
.operation-buttons .el-button .el-icon,
.operation-buttons .el-dropdown .el-button .el-icon {
  margin-right: 2px;
  font-size: 12px;
  height: 12px;
  width: 12px;
}

/* 下拉菜单项样式 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  line-height: 1;
  font-size: 13px;
  padding: 8px 12px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 5px;
  font-size: 13px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.test-case-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}

.test-steps-section, .test-history-section {
  margin-top: 20px;
}

.test-case-description {
  color: #606266;
  margin-bottom: 20px;
}

.import-templates {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.import-templates p {
  margin: 0;
  color: #606266;
}

.run-test-case {
  max-height: 70vh;
  overflow-y: auto;
}

.test-result-section {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}
</style>