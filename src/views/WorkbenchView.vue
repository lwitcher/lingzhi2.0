<script setup lang="ts">
import { ref } from 'vue';
import ServerDetails from '@/components/server/ServerDetails.vue';
import { ElMessage } from 'element-plus';

const selectedServer = ref(null);
const terminalLogs = ref([
  '',
  '[2025-03-22 09:00:00] 已连接到服务器 cluster-node-01',
  '[2025-03-22 09:00:02] 正在同步系统状态...',
  '[2025-03-22 09:00:05] 系统状态同步完成'
]);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogContent = ref('');

const servers = ref([
  { id: 1, name: '生产服务器-01', status: 'online' },
  { id: 2, name: '测试服务器-01', status: 'online' },
  { id: 3, name: '开发服务器-01', status: 'offline' }
]);

const dialogType = ref('');
const processList = ref([
  { pid: 1234, name: 'nginx', cpu: 12.5, memory: 45.2 },
  { pid: 5678, name: 'node', cpu: 23.1, memory: 67.8 }
]);

const tools = ref([]);

const openDialog = (action) => {
  dialogType.value = action;
  dialogTitle.value = {
    'restart': '服务器重启',
    'update': '配置更新',
    'monitor': '进程监控',
    'logs': '日志分析',
    'settings': '服务器设置',
    'toolchain': '一键部署工具链',
    'deploy': '一键部署交易系统',
    'files': '文件上传下载',
    'process': '进程管理'
  }[action];
  
  dialogContent.value = {
    'settings': `
      <div class="space-y-4">
        <el-form label-width="120px">
          <el-form-item label="服务器名称">
            <el-input placeholder="输入服务器名称" />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input placeholder="输入服务器IP" />
          </el-form-item>
          <el-form-item label="SSH端口">
            <el-input-number :min="1" :max="65535" />
          </el-form-item>
        </el-form>
      </div>
    `,
    'toolchain': `
      <div class="space-y-4">
        <el-checkbox-group v-model="tools">
          <el-checkbox label="JDK 17" />
          <el-checkbox label="Python 3.9" />
          <el-checkbox label="Node.js 18" />
          <el-checkbox label="Docker" />
        </el-checkbox-group>
        <el-divider />
        <el-button type="primary" plain>开始部署</el-button>
      </div>
    `,
    'deploy': `
      <div class="space-y-4">
        <el-select placeholder="选择交易系统版本" class="w-full">
          <el-option label="交易系统 v2.5.0" value="2.5.0" />
          <el-option label="交易系统 v2.4.3" value="2.4.3" />
        </el-select>
        <el-checkbox>包含示例数据</el-checkbox>
        <el-checkbox>自动配置数据库</el-checkbox>
        <el-divider />
        <el-button type="primary" plain>开始部署</el-button>
      </div>
    `,
    'files': `
      <div class="space-y-4">
        <el-upload
          class="upload-demo"
          drag
          action="https://your-upload-url"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
        </el-upload>
        <el-divider />
        <el-button type="primary" plain>下载选中文件</el-button>
      </div>
    `,
    'process': `
      <div class="space-y-4">
        <el-tabs type="border-card">
          <el-tab-pane label="进程列表">
            <el-table :data="processList" style="width: 100%">
              <el-table-column prop="pid" label="PID" width="80" />
              <el-table-column prop="name" label="进程名" />
              <el-table-column prop="cpu" label="CPU%" width="100" />
              <el-table-column prop="memory" label="内存%" width="100" />
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button size="small" type="danger">终止</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="启动进程">
            <el-form label-width="80px">
              <el-form-item label="进程名称">
                <el-input placeholder="输入进程名称" />
              </el-form-item>
              <el-form-item label="启动参数">
                <el-input placeholder="输入启动参数" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">启动</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    `
  }[action] || `正在准备${dialogTitle.value}配置...`;
  
  dialogVisible.value = true;
};
</script>

<template>
  <div class="workbench-container">
    <div class="grid grid-cols-1 gap-4"> <!-- 修改为单列布局 -->
      <!-- 功能操作区 -->
      <el-card shadow="hover" class="w-full"> <!-- 添加 w-full 类 -->
        <template #header>
          <h3 class="font-medium">服务器管理</h3>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <el-button type="primary" @click="openDialog('restart')">
            <template #icon><i-ep-refresh /></template>
            服务重启
          </el-button>
          <el-button type="primary" @click="openDialog('update')">
            <template #icon><i-ep-setting /></template>
            配置更新
          </el-button>
          <el-button type="primary" @click="openDialog('settings')">
            <template #icon><i-ep-tools /></template>
            服务器设置
          </el-button>
          <el-button type="primary" @click="openDialog('toolchain')">
            <template #icon><i-ep-cpu /></template>
            工具链部署
          </el-button>
          <el-button type="primary" @click="openDialog('deploy')">
            <template #icon><i-ep-data-line /></template>
            系统部署
          </el-button>
          <el-button type="primary" @click="openDialog('files')">
            <template #icon><i-ep-upload /></template>
            文件传输
          </el-button>
          <el-button type="primary" @click="openDialog('process')">
            <template #icon><i-ep-cpu /></template>
            进程管理
          </el-button>
        </div>
      </el-card>

      <el-card shadow="hover" class="w-full"> <!-- 添加 w-full 类 -->
        <template #header>
          <h3 class="font-medium">进程管理</h3>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <el-button type="primary" @click="openDialog('monitor')">
            <template #icon><i-ep-monitor /></template>
            进程监控
          </el-button>
          <el-button type="primary" @click="openDialog('logs')">
            <template #icon><i-ep-document /></template>
            日志分析
          </el-button>
        </div>
      </el-card>
      <!-- 终端输出 -->
      <el-card shadow="hover">
        <template #header>
          <h2 class="text-lg font-semibold">执行结果</h2>
        </template>
        <pre class="terminal-output">
          {{ terminalLogs.join('\n') }}
        </pre>
      </el-card>
    </div>

    <!-- 功能弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <!-- 服务器设置 -->
      <div v-if="dialogType === 'settings'">
        <el-form label-width="120px">
          <el-form-item label="服务器名称">
            <el-input placeholder="输入服务器名称" />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input placeholder="输入服务器IP" />
          </el-form-item>
          <el-form-item label="SSH端口">
            <el-input-number :min="1" :max="65535" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具链部署 -->
      <div v-else-if="dialogType === 'toolchain'">
        <el-checkbox-group v-model="tools">
          <el-checkbox label="JDK 17" />
          <el-checkbox label="Python 3.9" />
          <el-checkbox label="Node.js 18" />
          <el-checkbox label="Docker" />
        </el-checkbox-group>
      </div>

      <!-- 进程管理 -->
      <div v-else-if="dialogType === 'process'">
        <el-tabs type="border-card">
          <el-tab-pane label="进程列表">
            <el-table :data="processList">
              <el-table-column prop="pid" label="PID" width="80" />
              <el-table-column prop="name" label="进程名" />
              <el-table-column prop="cpu" label="CPU%" width="100" />
              <el-table-column prop="memory" label="内存%" width="100" />
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button size="small" type="danger">终止</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="启动进程">
            <el-form label-width="80px">
              <el-form-item label="进程名称">
                <el-input placeholder="输入进程名称" />
              </el-form-item>
              <el-form-item label="启动参数">
                <el-input placeholder="输入启动参数" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">启动</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确认执行
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.workbench-container {
  @apply p-4;
}

.terminal-output {
  @apply bg-gray-800 text-green-400 p-4 rounded overflow-auto;
  height: 200px;
  font-family: 'Courier New', monospace;
}

/* 修改按钮容器样式 */
.el-card .grid {
  @apply gap-1 px-2; /* 添加左右内边距 */
}

/* 修改按钮样式 */
.el-card .el-button {
  @apply w-full; /* 改为全宽 */
  margin: 0.1rem 0; /* 只保留上下间距 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.4rem 0.5rem; /* 调整内边距 */
  min-height: 36px; /* 统一高度 */
}

/* 调整卡片间距 */
.el-card {
  @apply p-2 mb-4; /* 添加底部间距 */
}
</style>