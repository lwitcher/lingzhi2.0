<script setup lang="ts">
import { ref } from 'vue';
import ServerDetails from '@/components/server/ServerDetails.vue';
import { ElMessage } from 'element-plus';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import {
  Refresh,
  Setting,
  Tools,
  Cpu,
  DataLine,
  Upload,
  Monitor,
  Document,
  Lock,
  Notification,
  Warning
} from '@element-plus/icons-vue'

interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}

const selectedServer = ref<any>(null);
const terminalLogs = ref<string[]>([
  '',
  '[2025-03-22 09:00:00] 已连接到服务器 cluster-node-01',
  '[2025-03-22 09:00:02] 正在同步系统状态...',
  '[2025-03-22 09:00:05] 系统状态同步完成'
]);

const processList = ref<Process[]>([
  { pid: 1024, name: 'nginx', cpu: 12.5, memory: 32.4 },
  { pid: 2048, name: 'mysql', cpu: 8.7, memory: 45.2 },
  { pid: 3072, name: 'node', cpu: 15.3, memory: 28.1 }
]);

const deployConfig = ref({
  path: '/opt/trading-system',
  repository: 'https://github.com/example/trading-system.git',
  branch: 'main',
  multicast: '239.255.0.1:5000'
})

const quickActionCollapsed = ref(false);

// 添加卡片折叠状态控制变量
const serverCardCollapsed = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogContent = ref('');

const serverConfigVisible = ref(false)
const serverConfigForm = ref({
  ip: '',
  username: '',
  password: ''
})

interface Server {
  id: number;
  name: string;
  status: 'online' | 'offline';
}

const servers = ref<Server[]>([
  { id: 1, name: '生产服务器-01', status: 'online' },
  { id: 2, name: '测试服务器-01', status: 'online' },
  { id: 3, name: '开发服务器-01', status: 'offline' }
]);

const dialogType = ref('');

const tools = ref<string[]>([]);

const openDialog = (action: 'restart' | 'toolchain' | 'process' | 'deploy' | 'files') => {
  dialogType.value = action;
  dialogTitle.value = {
    'restart': '服务器重启',
    'toolchain': '一键部署工具链',
    'process': '进程管理',  
    'deploy': '系统部署',
    'files': '文件传输'
  }[action];
  
  dialogContent.value = {
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
    `,
    'deploy': `
      <div class="space-y-4">
        <p>准备部署系统配置...</p>
      </div>
    `,
    'files': `
      <div class="space-y-4">
        <p>准备文件传输配置...</p>
      </div>
    `,
    'restart': `
      <div class="space-y-4">
        <p>准备服务器重启配置...</p>
      </div>
    `
  }[action] || `正在准备${dialogTitle.value}配置...`;
  
  dialogVisible.value = true;
};
</script>

<template>
  <div class="workbench-container">
    <div class="grid grid-cols-1 gap-4">
      <!-- 功能操作区 -->
      <el-card shadow="hover" class="w-full">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-medium">服务器管理</h3>
            <el-button 
              type="primary"
              size="small"
              :icon="serverCardCollapsed ? ArrowDown : ArrowUp"
              @click="serverCardCollapsed = !serverCardCollapsed"
              class="collapse-btn"
              text
            />
          </div>
        </template>
        <div v-show="!serverCardCollapsed" class="grid grid-cols-6 gap-3">
          <el-button type="success" @click="serverConfigVisible = true">
            <template #icon><el-icon><Tools /></el-icon></template>
            功能设置
          </el-button>
          <el-button type="primary" @click="openDialog('restart')">
            <template #icon><el-icon><Refresh /></el-icon></template>
            服务器重启
          </el-button>
          <el-button type="primary" @click="openDialog('toolchain')">
            <template #icon><el-icon><Cpu /></el-icon></template>
            工具链部署
          </el-button>
          <el-button type="primary" @click="openDialog('deploy')">
            <template #icon><el-icon><DataLine /></el-icon></template>
            系统部署
          </el-button>
          <el-button type="primary" @click="openDialog('files')">
            <template #icon><el-icon><Upload /></el-icon></template>
            文件传输
          </el-button>
          <el-button type="primary" @click="openDialog('process')">
            <template #icon><el-icon><Cpu /></el-icon></template>
            进程管理
          </el-button>
        </div>
      </el-card>
      <el-card shadow="hover" class="w-full">
  <template #header>
    <div class="flex justify-between items-center">
      <h3 class="font-medium">交易系统快捷操作</h3>
      <el-button 
        type="primary"
        size="small"
        :icon="quickActionCollapsed ? ArrowDown : ArrowUp"
        @click="quickActionCollapsed = !quickActionCollapsed"
        class="collapse-btn"
        text
      />
    </div>
  </template>
  <div v-show="!quickActionCollapsed" class="grid grid-cols-6 gap-3">
    <el-button type="warning" @click="">
      <template #icon><el-icon><Lock /></el-icon></template>
      禁用CA
    </el-button>
    <el-button type="success" @click="">
      <template #icon><el-icon><Notification /></el-icon></template>
      一键开市
    </el-button>
    <el-button type="danger" @click="">
      <template #icon><el-icon><Refresh /></el-icon></template>
      重启交易系统
    </el-button>
    <el-button type="info" @click="">
      <template #icon><el-icon><Warning /></el-icon></template>
      确认反演状态
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
    <el-dialog
      v-model="serverConfigVisible"
      title="服务器连接配置"
      width="500px"
    >
    <el-form label-width="80px">
        <el-form-item label="IP地址">
          <el-input v-model="serverConfigForm.ip" placeholder="输入服务器IP" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="serverConfigForm.username" placeholder="输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input 
            v-model="serverConfigForm.password" 
            type="password" 
            placeholder="输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serverConfigVisible = false">取消</el-button>
        <el-button type="success" @click="serverConfigVisible = false">
          保存配置
        </el-button>
      </template>
  </el-dialog>
    <!-- 功能弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <!-- 工具链部署 -->
      <div v-if="dialogType === 'toolchain'">
        <el-checkbox-group v-model="tools">
          <el-checkbox label="JDK 17" />
          <el-checkbox label="Python 3.9" />
          <el-checkbox label="Node.js 18" />
          <el-checkbox label="Docker" />
        </el-checkbox-group>
      </div>

      <!-- 文件传输 -->
      <div v-else-if="dialogType === 'files'">
        <div class="space-y-4">
          <el-upload
            class="upload-demo"
            drag
            action="https://your-upload-url"
            multiple
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
          </el-upload>
          <el-divider />
          <el-button type="primary" plain class="w-full">下载选中文件</el-button>
        </div>
      </div>

      <div v-else-if="dialogType === 'deploy'">
        <el-form label-width="120px" class="space-y-4">
          <el-form-item label="部署路径">
            <el-input v-model="deployConfig.path" placeholder="输入部署绝对路径" />
          </el-form-item>
          <el-form-item label="仓库地址">
            <el-select v-model="deployConfig.repository" class="w-full">
              <el-option 
                label="生产仓库 (github.com/example/trading-system)"
                value="https://github.com/example/trading-system.git"
              />
              <el-option
                label="测试仓库 (gitlab.com/test/trading-system)"
                value="https://gitlab.com/test/trading-system.git"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="代码分支">
            <el-select v-model="deployConfig.branch" class="w-full">
              <el-option label="主干分支 (main)" value="main" />
              <el-option label="发布分支 (release)" value="release" />
              <el-option label="开发分支 (dev)" value="dev" />
            </el-select>
          </el-form-item>
          <el-form-item label="组播地址">
            <el-input v-model="deployConfig.multicast" placeholder="239.255.0.1:5000">
              <template #append>
                <el-button @click="deployConfig.multicast = '239.255.0.1:5000'">
                  重置默认
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <el-divider />
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

/* 修改折叠按钮样式 */
.el-card .flex .el-button.collapse-btn {
  width: auto;
  height: auto;
  padding: 4px;
  background: transparent !important;
  border: none !important;
  color: var(--el-color-primary);
}

.el-card .flex .el-button.collapse-btn:hover {
  transform: none;
  color: var(--el-color-primary-light-3);
}
.el-card .flex .el-button.collapse-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>