<template>
  <div class="test-case-filter">
    <el-card class="filter-card">
      <div class="filter-header">
        <h3>筛选条件</h3>
        <div class="header-actions">
          <el-button 
            type="text" 
            @click="resetFilters"
            :disabled="!isFiltered"
          >
            <el-icon><RefreshRight /></el-icon>
            重置筛选
          </el-button>
          <el-button 
            type="text" 
            @click="toggleAdvanced"
          >
            <el-icon v-if="showAdvanced"><ArrowUp /></el-icon>
            <el-icon v-else><ArrowDown /></el-icon>
            {{ showAdvanced ? '隐藏高级筛选' : '显示高级筛选' }}
          </el-button>
        </div>
      </div>

      <div class="quick-filter">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索测试用例名称、ID、描述..."
          clearable
          @input="handleFilterChange"
          style="width: 100%"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <el-select 
            v-model="filters.keywordField" 
            slot="append" 
            style="width: 110px"
          >
            <el-option label="全部字段" value="all" />
            <el-option label="ID" value="id" />
            <el-option label="名称" value="name" />
            <el-option label="描述" value="description" />
          </el-select>
        </el-input>
      </div>

      <el-row :gutter="20" class="basic-filter-row">
        <el-col :span="8">
          <el-select 
            v-model="filters.category" 
            placeholder="测试分类" 
            clearable 
            multiple
            collapse-tags
            @change="handleFilterChange"
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
        
        <el-col :span="8">
          <el-select 
            v-model="filters.priority" 
            placeholder="优先级" 
            clearable 
            multiple
            collapse-tags
            @change="handleFilterChange"
            style="width: 100%"
          >
            <el-option label="P0 - 阻断性" value="P0">
              <el-tag type="danger" size="mini">P0</el-tag> 阻断性
            </el-option>
            <el-option label="P1 - 严重" value="P1">
              <el-tag type="warning" size="mini">P1</el-tag> 严重
            </el-option>
            <el-option label="P2 - 一般" value="P2">
              <el-tag type="success" size="mini">P2</el-tag> 一般
            </el-option>
            <el-option label="P3 - 次要" value="P3">
              <el-tag type="info" size="mini">P3</el-tag> 次要
            </el-option>
          </el-select>
        </el-col>
        
        <el-col :span="8">
          <el-select 
            v-model="filters.status" 
            placeholder="状态" 
            clearable 
            multiple
            collapse-tags
            @change="handleFilterChange"
            style="width: 100%"
          >
            <el-option label="活跃" value="active">
              <el-tag type="success" size="mini">活跃</el-tag>
            </el-option>
            <el-option label="废弃" value="deprecated">
              <el-tag type="info" size="mini">废弃</el-tag>
            </el-option>
            <el-option label="草稿" value="draft">
              <el-tag type="warning" size="mini">草稿</el-tag>
            </el-option>
          </el-select>
        </el-col>
      </el-row>

      <div v-show="showAdvanced" class="advanced-filters">
        <el-divider content-position="left">高级筛选</el-divider>
        
        <el-row :gutter="20" class="advanced-filter-row">
          <el-col :span="8">
            <el-select 
              v-model="filters.module" 
              placeholder="所属模块" 
              clearable 
              multiple
              collapse-tags
              filterable
              allow-create
              default-first-option
              @change="handleFilterChange"
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
          
          <el-col :span="8">
            <el-select 
              v-model="filters.creator" 
              placeholder="创建人" 
              clearable 
              multiple
              collapse-tags
              filterable
              @change="handleFilterChange"
              style="width: 100%"
            >
              <el-option
                v-for="item in creatorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
          
          <el-col :span="8">
            <el-select 
              v-model="filters.lastRunResult" 
              placeholder="最近执行结果" 
              clearable 
              multiple
              collapse-tags
              @change="handleFilterChange"
              style="width: 100%"
            >
              <el-option label="通过" value="通过">
                <el-tag type="success" size="mini">通过</el-tag>
              </el-option>
              <el-option label="失败" value="失败">
                <el-tag type="danger" size="mini">失败</el-tag>
              </el-option>
              <el-option label="阻塞" value="阻塞">
                <el-tag type="warning" size="mini">阻塞</el-tag>
              </el-option>
              <el-option label="跳过" value="跳过">
                <el-tag type="info" size="mini">跳过</el-tag>
              </el-option>
              <el-option label="未执行" value="未执行">
                <span style="color: #909399">未执行</span>
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="advanced-filter-row">
          <el-col :span="8">
            <el-input 
              v-model="filters.estimatedDuration" 
              placeholder="预计执行时间 (分钟)" 
              clearable
              @input="handleFilterChange"
            >
              <template slot="prepend">
                <el-select v-model="filters.durationOperator" style="width: 80px">
                  <el-option label="等于" value="=" />
                  <el-option label="小于" value="<" />
                  <el-option label="大于" value=">" />
                  <el-option label="范围" value="range" />
                </el-select>
              </template>
              <template v-if="filters.durationOperator === 'range'" slot="append">
                <el-input v-model="filters.estimatedDurationMax" placeholder="最大值" style="width: 80px" />
              </template>
            </el-input>
          </el-col>
          
          <el-col :span="8">
            <el-date-picker
              v-model="filters.createdAt"
              type="daterange"
              range-separator="至"
              start-placeholder="创建开始日期"
              end-placeholder="创建结束日期"
              value-format="yyyy-MM-dd"
              @change="handleFilterChange"
              style="width: 100%"
            />
          </el-col>
          
          <el-col :span="8">
            <el-date-picker
              v-model="filters.lastRunTime"
              type="daterange"
              range-separator="至"
              start-placeholder="执行开始日期"
              end-placeholder="执行结束日期"
              value-format="yyyy-MM-dd"
              @change="handleFilterChange"
              style="width: 100%"
            />
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="advanced-filter-row">
          <el-col :span="12">
            <el-input 
              v-model="filters.tag" 
              placeholder="标签(使用空格分隔多个标签)" 
              clearable
              @input="handleFilterChange"
            >
              <template slot="prepend">
                <el-select v-model="filters.tagMatchType" style="width: 120px">
                  <el-option label="包含任一" value="any" />
                  <el-option label="包含全部" value="all" />
                  <el-option label="精确匹配" value="exact" />
                </el-select>
              </template>
            </el-input>
          </el-col>
          
          <el-col :span="12">
            <el-input 
              v-model="filters.relatedRequirements" 
              placeholder="关联需求ID" 
              clearable
              @input="handleFilterChange"
            />
          </el-col>
        </el-row>
        
        <el-row :gutter="20" class="advanced-filter-row">
          <el-col :span="12">
            <el-select 
              v-model="filters.reviewStatus" 
              placeholder="审阅状态" 
              clearable 
              multiple
              collapse-tags
              @change="handleFilterChange"
              style="width: 100%"
            >
              <el-option label="已通过" value="approved">
                <el-tag type="success" size="mini">已通过</el-tag>
              </el-option>
              <el-option label="未通过" value="rejected">
                <el-tag type="danger" size="mini">未通过</el-tag>
              </el-option>
              <el-option label="待审阅" value="pending">
                <el-tag type="warning" size="mini">待审阅</el-tag>
              </el-option>
              <el-option label="未审阅" value="not_reviewed">
                <el-tag type="info" size="mini">未审阅</el-tag>
              </el-option>
            </el-select>
          </el-col>
          
          <el-col :span="12">
            <el-select 
              v-model="filters.reviewer" 
              placeholder="审阅人" 
              clearable 
              multiple
              collapse-tags
              filterable
              @change="handleFilterChange"
              style="width: 100%"
            >
              <el-option
                v-for="item in reviewerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <div class="active-filters" v-if="activeFilters.length > 0">
        <el-divider content-position="left">已启用的筛选</el-divider>
        <div class="filter-tags">
          <el-tag
            v-for="(filter, index) in activeFilters"
            :key="index"
            closable
            @close="removeFilter(filter.key, filter.value)"
            class="filter-tag"
          >
            <span class="filter-key">{{ getFilterLabel(filter.key) }}:</span>
            <span class="filter-value">{{ formatFilterValue(filter.key, filter.value) }}</span>
          </el-tag>
        </div>
      </div>

      <div class="filter-actions">
        <el-button 
          type="primary" 
          @click="applyFilters"
          :disabled="!isFiltered"
        >
          <el-icon><Search /></el-icon>
          应用筛选
        </el-button>
        <el-button 
          type="info" 
          @click="saveAsPreset"
          :disabled="!isFiltered"
        >
          <el-icon><StarFilled /></el-icon>
          保存为预设
        </el-button>
        <el-dropdown v-if="presets.length > 0" @command="loadPreset" trigger="click">
          <el-button type="success">
            <el-icon><Star /></el-icon>
            加载预设
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              v-for="(preset, index) in presets" 
              :key="index"
              :command="index"
            >
              {{ preset.name }}
              <span class="preset-remove" @click.stop="removePreset(index)">
                <el-icon><Delete /></el-icon>
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-card>
    
    <!-- 保存预设对话框 -->
    <el-dialog
      title="保存筛选预设"
      :visible.sync="presetDialogVisible"
      width="30%"
    >
      <el-form :model="presetForm" ref="presetForm" :rules="presetRules">
        <el-form-item label="预设名称" prop="name">
          <el-input v-model="presetForm.name" placeholder="请输入预设名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="presetForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="预设描述(可选)"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="presetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSavePreset">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 测试用例筛选组件，提供基本和高级筛选功能
 */
import { RefreshRight, ArrowUp, ArrowDown, Search, Star, StarFilled, Delete } from '@element-plus/icons-vue'

export default {
  name: 'TestCaseFilter',
  components: {
    RefreshRight,
    ArrowUp,
    ArrowDown,
    Search,
    Star,
    StarFilled,
    Delete
  },
  data() {
    return {
      // 显示高级筛选
      showAdvanced: false,
      
      // 筛选预设对话框
      presetDialogVisible: false,
      presetForm: {
        name: '',
        description: ''
      },
      presetRules: {
        name: [
          { required: true, message: '请输入预设名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度应为2到20个字符', trigger: 'blur' }
        ]
      },
      
      // 筛选条件
      filters: {
        keyword: '',
        keywordField: 'all',
        category: [],
        priority: [],
        status: [],
        module: [],
        creator: [],
        lastRunResult: [],
        estimatedDuration: '',
        estimatedDurationMax: '',
        durationOperator: '=',
        createdAt: [],
        lastRunTime: [],
        tag: '',
        tagMatchType: 'any',
        relatedRequirements: '',
        reviewStatus: [],
        reviewer: []
      },
      
      // 保存的筛选预设
      presets: [],
      
      // 分类选项
      categoryOptions: [
        { value: '功能测试', label: '功能测试' },
        { value: '性能测试', label: '性能测试' },
        { value: '接口测试', label: '接口测试' },
        { value: '安全测试', label: '安全测试' },
        { value: '兼容性测试', label: '兼容性测试' },
        { value: '回归测试', label: '回归测试' }
      ],
      
      // 模块选项
      moduleOptions: [
        { value: '用户管理', label: '用户管理' },
        { value: '权限控制', label: '权限控制' },
        { value: '数据导入', label: '数据导入' },
        { value: '报表统计', label: '报表统计' },
        { value: '系统配置', label: '系统配置' },
        { value: '消息通知', label: '消息通知' }
      ],
      
      // 创建人选项
      creatorOptions: [
        { value: '张测试', label: '张测试' },
        { value: '李工程师', label: '李工程师' },
        { value: '王测试', label: '王测试' },
        { value: '赵经理', label: '赵经理' }
      ],
      
      // 审阅人选项
      reviewerOptions: [
        { value: '张测试', label: '张测试' },
        { value: '李工程师', label: '李工程师' },
        { value: '王测试', label: '王测试' },
        { value: '赵经理', label: '赵经理' }
      ]
    };
  },
  computed: {
    /**
     * 判断是否有活跃筛选条件
     */
    isFiltered() {
      return this.activeFilters.length > 0;
    },
    
    /**
     * 获取当前活跃的筛选条件
     */
    activeFilters() {
      const activeFilters = [];
      
      // 检查每个筛选条件是否有值
      Object.entries(this.filters).forEach(([key, value]) => {
        // 跳过操作符和辅助字段
        if (['keywordField', 'durationOperator', 'tagMatchType', 'estimatedDurationMax'].includes(key)) {
          return;
        }
        
        // 检查是否有值
        if (Array.isArray(value)) {
          if (value.length > 0) {
            activeFilters.push({ key, value });
          }
        } else if (value !== '' && value !== null && value !== undefined) {
          // 处理估计时间范围
          if (key === 'estimatedDuration' && this.filters.durationOperator === 'range') {
            const rangeValue = `${value}-${this.filters.estimatedDurationMax}`;
            activeFilters.push({ key, value: rangeValue });
          } else {
            activeFilters.push({ key, value });
          }
        }
      });
      
      return activeFilters;
    }
  },
  created() {
    // 从本地存储加载预设
    this.loadPresetsFromStorage();
  },
  methods: {
    /**
     * 处理筛选条件变化
     */
    handleFilterChange() {
      // 通知父组件筛选条件已变更，但未应用
      this.$emit('filter-changed', this.getFilterParams());
    },
    
    /**
     * 应用筛选条件
     */
    applyFilters() {
      // 通知父组件应用筛选条件
      this.$emit('filter-applied', this.getFilterParams());
    },
    
    /**
     * 重置所有筛选条件
     */
    resetFilters() {
      this.filters = {
        keyword: '',
        keywordField: 'all',
        category: [],
        priority: [],
        status: [],
        module: [],
        creator: [],
        lastRunResult: [],
        estimatedDuration: '',
        estimatedDurationMax: '',
        durationOperator: '=',
        createdAt: [],
        lastRunTime: [],
        tag: '',
        tagMatchType: 'any',
        relatedRequirements: '',
        reviewStatus: [],
        reviewer: []
      };
      
      // 通知父组件筛选条件已重置
      this.$emit('filter-reset');
      this.$emit('filter-applied', this.getFilterParams());
    },
    
    /**
     * 移除特定筛选条件
     */
    removeFilter(key, value) {
      if (Array.isArray(this.filters[key])) {
        // 如果是数组，移除特定值
        if (typeof value === 'string' && value.includes('-') && key === 'estimatedDuration') {
          // 处理估计时间范围
          this.filters.estimatedDuration = '';
          this.filters.estimatedDurationMax = '';
        } else {
          const index = this.filters[key].indexOf(value);
          if (index !== -1) {
            this.filters[key].splice(index, 1);
          }
        }
      } else {
        // 如果是单值，设为空
        this.filters[key] = '';
        
        // 如果是估计时间，同时清除最大值
        if (key === 'estimatedDuration') {
          this.filters.estimatedDurationMax = '';
        }
      }
      
      // 通知父组件筛选条件已变更
      this.$emit('filter-changed', this.getFilterParams());
      this.$emit('filter-applied', this.getFilterParams());
    },
    
    /**
     * 切换高级筛选显示状态
     */
    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },
    
    /**
     * 获取筛选参数对象
     */
    getFilterParams() {
      const params = {};
      
      // 遍历活跃筛选条件
      this.activeFilters.forEach(filter => {
        params[filter.key] = filter.value;
      });
      
      // 添加操作符和辅助字段
      if (params.estimatedDuration) {
        params.durationOperator = this.filters.durationOperator;
      }
      
      if (params.keyword) {
        params.keywordField = this.filters.keywordField;
      }
      
      if (params.tag) {
        params.tagMatchType = this.filters.tagMatchType;
      }
      
      return params;
    },
    
    /**
     * 显示保存预设对话框
     */
    saveAsPreset() {
      this.presetForm = {
        name: '',
        description: ''
      };
      this.presetDialogVisible = true;
    },
    
    /**
     * 确认保存筛选预设
     */
    confirmSavePreset() {
      this.$refs.presetForm.validate(valid => {
        if (valid) {
          // 创建预设对象
          const preset = {
            name: this.presetForm.name,
            description: this.presetForm.description,
            filters: JSON.parse(JSON.stringify(this.filters)),
            createdAt: new Date().toISOString()
          };
          
          // 添加到预设列表
          this.presets.push(preset);
          
          // 保存到本地存储
          this.savePresetsToStorage();
          
          this.$message.success('筛选预设保存成功');
          this.presetDialogVisible = false;
        }
      });
    },
    
    /**
     * 加载筛选预设
     */
    loadPreset(index) {
      if (index >= 0 && index < this.presets.length) {
        // 加载预设的筛选条件
        this.filters = JSON.parse(JSON.stringify(this.presets[index].filters));
        
        // 应用筛选条件
        this.applyFilters();
        
        this.$message.success(`已加载预设: ${this.presets[index].name}`);
      }
    },
    
    /**
     * 移除筛选预设
     */
    removePreset(index) {
      this.$confirm('确定要删除此筛选预设吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 从预设列表移除
        this.presets.splice(index, 1);
        
        // 更新本地存储
        this.savePresetsToStorage();
        
        this.$message.success('预设已删除');
      }).catch(() => {
        // 取消删除
      });
    },
    
    /**
     * 保存预设到本地存储
     */
    savePresetsToStorage() {
      try {
        localStorage.setItem('testCaseFilterPresets', JSON.stringify(this.presets));
      } catch (e) {
        console.error('Failed to save presets to localStorage', e);
      }
    },
    
    /**
     * 从本地存储加载预设
     */
    loadPresetsFromStorage() {
      try {
        const savedPresets = localStorage.getItem('testCaseFilterPresets');
        if (savedPresets) {
          this.presets = JSON.parse(savedPresets);
        }
      } catch (e) {
        console.error('Failed to load presets from localStorage', e);
        this.presets = [];
      }
    },
    
    /**
     * 获取筛选条件的显示标签
     */
    getFilterLabel(key) {
      const labelMap = {
        keyword: '关键词',
        category: '测试分类',
        priority: '优先级',
        status: '状态',
        module: '所属模块',
        creator: '创建人',
        lastRunResult: '执行结果',
        estimatedDuration: '预计时间',
        createdAt: '创建日期',
        lastRunTime: '执行日期',
        tag: '标签',
        relatedRequirements: '关联需求',
        reviewStatus: '审阅状态',
        reviewer: '审阅人'
      };
      return labelMap[key] || key;
    },
    
    /**
     * 格式化筛选值显示
     */
    formatFilterValue(key, value) {
      // 处理数组类型的值
      if (Array.isArray(value)) {
        if (value.length === 0) return '';
        if (value.length === 1) return value[0];
        return `${value[0]} +${value.length - 1}`;
      }
      
      // 处理特殊类型的值
      if (key === 'estimatedDuration' && this.filters.durationOperator) {
        const operator = this.filters.durationOperator;
        if (operator === '=') return `= ${value}`;
        if (operator === '<') return `< ${value}`;
        if (operator === '>') return `> ${value}`;
        if (operator === 'range') return value; // 已经格式化为 "min-max"
      }
      
      // 处理标签匹配类型
      if (key === 'tag' && this.filters.tagMatchType) {
        const matchType = this.filters.tagMatchType;
        if (matchType === 'any') return `任一 "${value}"`;
        if (matchType === 'all') return `全部 "${value}"`;
        if (matchType === 'exact') return `精确 "${value}"`;
      }
      
      return value;
    }
  }
}
</script>

<style scoped>
.test-case-filter {
  margin-bottom: 20px;
}

.filter-card {
  border-radius: 4px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-header h3 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.quick-filter {
  margin-bottom: 15px;
}

.basic-filter-row {
  margin-bottom: 15px;
}

.advanced-filters {
  margin-top: 10px;
}

.advanced-filter-row {
  margin-bottom: 15px;
}

.active-filters {
  margin-top: 20px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tag {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.filter-key {
  font-weight: bold;
  margin-right: 5px;
}

.filter-value {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.preset-remove {
  margin-left: 10px;
  color: #F56C6C;
  cursor: pointer;
}

.preset-remove:hover {
  color: #F78989;
}
</style>