<template>
  <div class="flow-editor">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="button-group">
          <el-button type="primary" @click="handleSave" class="action-button">
            <el-icon><Save /></el-icon>
            保存
          </el-button>
          <el-button type="success" @click="handleImport" class="action-button">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
          <el-button type="warning" @click="handleExport" class="action-button">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button type="info" @click="handleUndo" :disabled="!canUndo">
            <el-icon><Back /></el-icon>
            撤销
          </el-button>
          <el-button type="info" @click="handleRedo" :disabled="!canRedo">
            <el-icon><Right /></el-icon>
            重做
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-button @click="handleZoomIn">
            <el-icon><ZoomIn /></el-icon>
            放大
          </el-button>
          <el-button @click="handleZoomOut">
            <el-icon><ZoomOut /></el-icon>
            缩小
          </el-button>
          <el-button @click="handleResetZoom">
            <el-icon><FullScreen /></el-icon>
            适应画布
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-button type="danger" @click="handleClear">
          <el-icon><Delete /></el-icon>
          清空画布
        </el-button>
      </div>
    </div>

    <div class="editor-container">
      <div class="node-panel">
        <div class="panel-title">元素</div>
        <div class="panel-content">
          <div 
            class="node-item" 
            v-for="(item, index) in nodeList" 
            :key="index" 
            @mousedown="onDragStart($event, item)"
          >
            <el-icon v-if="item.type === 'rect'"><Notebook /></el-icon>
            <el-icon v-else-if="item.type === 'circle'"><MostlyCloudy /></el-icon>
            <el-icon v-else-if="item.type === 'diamond'"><Operation /></el-icon>
            <el-icon v-else-if="item.type === 'ellipse'"><Sunny /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="canvas-container">
        <div id="flow-canvas" ref="container"></div>
      </div>

      <div class="properties-panel">
        <div class="panel-title">属性</div>
        <div class="panel-content" v-if="selectedNode">
          <el-form label-position="left" label-width="80px" size="small">
            <el-form-item label="文本">
              <el-input v-model="selectedNode.text.value" @change="updateNodeText"></el-input>
            </el-form-item>
            <template v-if="selectedNode.type === 'rect'">
              <el-form-item label="会员号">
                <el-input v-model="selectedNode.properties.memberId" @change="updateNodeProperties"></el-input>
              </el-form-item>
              <el-form-item label="席位号">
                <el-input v-model="selectedNode.properties.seatId" @change="updateNodeProperties"></el-input>
              </el-form-item>
              <el-form-item label="交易类型">
                <el-select v-model="selectedNode.properties.tradeType" @change="updateNodeProperties">
                  <el-option label="期货" value="期货"></el-option>
                  <el-option label="期权" value="期权"></el-option>
                  <el-option label="套利互换UDS" value="套利互换UDS"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="订单属性">
                <el-select v-model="selectedNode.properties.orderProperty" @change="updateNodeProperties">
                  <el-option label="无属性" value="无属性"></el-option>
                  <el-option label="FAK" value="FAK"></el-option>
                  <el-option label="FOK" value="FOK"></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template v-if="selectedNode.type === 'circle'">
              <el-form-item label="系统委托号">
                <el-input 
                  type="textarea" 
                  v-model="selectedNode.properties.systemOrderId" 
                  :rows="3"
                  @change="updateNodeProperties"
                ></el-input>
              </el-form-item>
            </template>
            <el-form-item label="用例描述">
              <el-input 
                type="textarea" 
                v-model="selectedNode.properties.description" 
                :rows="3"
                placeholder="请输入用例描述"
                @change="updateNodeDescription"
              ></el-input>
            </el-form-item>
            <template v-if="selectedNode.properties">
              <el-form-item label="颜色">
                <el-color-picker v-model="selectedNode.properties.color" @change="updateNodeStyle"></el-color-picker>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div class="panel-content" v-else-if="selectedEdge">
          <el-form label-position="left" label-width="80px" size="small">
            <el-form-item label="文本">
              <el-input v-model="selectedEdge.text.value" @change="updateEdgeText"></el-input>
            </el-form-item>
            <el-form-item label="线型">
              <el-select v-model="selectedEdge.properties.lineStyle" @change="updateEdgeStyle">
                <el-option label="实线" value="solid"></el-option>
                <el-option label="虚线" value="dashed"></el-option>
                <el-option label="点线" value="dotted"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="线条宽度">
              <el-input-number 
                v-model="selectedEdge.properties.lineWidth" 
                :min="1" 
                :max="10" 
                @change="updateEdgeStyle"
              ></el-input-number>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="selectedEdge.properties.color" @change="updateEdgeStyle"></el-color-picker>
            </el-form-item>
          </el-form>
        </div>
        <div class="panel-content empty-panel" v-else>
          <el-empty description="请选择节点或连线以编辑属性"></el-empty>
        </div>
      </div>
    </div>

    <!-- 导入对话框 -->
    <el-dialog
      title="导入流程图"
      v-model="importDialogVisible"
      width="500px"
    >
      <el-tabs v-model="importType">
        <el-tab-pane label="JSON" name="json">
          <el-input
            type="textarea"
            v-model="importJson"
            rows="10"
            placeholder="请粘贴LogicFlow JSON数据"
          ></el-input>
        </el-tab-pane>
        <el-tab-pane label="文件" name="file">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><Upload /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip">支持 .json 文件</div>
          </el-upload>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmImport">确认导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 保存对话框 -->
    <el-dialog
      title="保存流程图"
      v-model="saveDialogVisible"
      width="500px"
    >
      <el-form :model="saveForm" label-width="100px">
        <el-form-item label="流程图名称">
          <el-input v-model="saveForm.name" placeholder="请输入流程图名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            type="textarea" 
            v-model="saveForm.description" 
            placeholder="请输入流程图描述"
            rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSave">确认保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
/**
 * @description 基于LogicFlow的流程图编辑器组件
 */
import { ref, onMounted, reactive, nextTick, onUnmounted } from 'vue';
import LogicFlow from '@logicflow/core';
import { DndPanel, Control, SelectionSelect, MiniMap, ProximityConnect } from '@logicflow/extension';
import '@logicflow/core/dist/index.css';
import '@logicflow/extension/lib/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

export default {
  name: 'FlowEditor',
  components: {
    ...ElementPlusIconsVue
  },
  emits: ['save'],
  setup(props, { emit }) {
    const container = ref(null);
    const lf = ref(null);
    const canUndo = ref(false);
    const canRedo = ref(false);
    const selectedNode = ref(null);
    const selectedEdge = ref(false);
    const importDialogVisible = ref(false);
    const saveDialogVisible = ref(false);
    const importType = ref('json');
    const importJson = ref('');
    const importFile = ref(null);
    
    const saveForm = reactive({
      name: '',
      description: ''
    });

    // 定义可拖拽的节点类型
    const nodeList = [
      { 
        type: 'rect', 
        label: '下单', 
        properties: { 
          width: 120, 
          height: 60, 
          color: '#FFFFFF', 
          borderColor: '#1890FF',
          memberId: '',
          seatId: '',
          tradeType: '期货',
          orderProperty: '无属性'
        } 
      },
      { 
        type: 'circle', 
        label: '撤单', 
        properties: { 
          r: 35, 
          color: '#FFFFFF', 
          borderColor: '#1890FF',
          systemOrderId: ''
        } 
      },
      { 
        type: 'diamond', 
        label: '获取结果', 
        properties: { 
          width: 120, 
          height: 80, 
          color: '#FFFFFF', 
          borderColor: '#1890FF'
        } 
      }
    ];

    // 初始化流程图编辑器
    onMounted(() => {
      // 注册插件
      LogicFlow.use(DndPanel);
      LogicFlow.use(SelectionSelect);
      LogicFlow.use(Control);
      LogicFlow.use(MiniMap);
      LogicFlow.use(ProximityConnect);

      // 创建编辑器实例
      lf.value = new LogicFlow({
        container: container.value,
        grid: true,
        plugins: [],
        nodeTextEdit: true,
        edgeTextEdit: true,
        edgeType: 'polyline',
        stopZoomGraph: false,
        stopScrollGraph: false,
        pluginOptions: {
          proximityConnect: {
            distance: 200 // 连接触发距离
          }
        }
      });

      // 初始化
      lf.value.render();

      // 监听事件
      lf.value.on('history:change', ({ data }) => {
        canUndo.value = data.undoAble;
        canRedo.value = data.redoAble;
      });

      // 监听节点选择事件
      lf.value.on('node:click', ({ data }) => {
        selectedNode.value = data;
        selectedEdge.value = null;
      });

      // 监听边选择事件
      lf.value.on('edge:click', ({ data }) => {
        selectedEdge.value = data;
        selectedNode.value = null;
      });

      // 监听画布点击事件 - 取消选择
      lf.value.on('blank:click', () => {
        selectedNode.value = null;
        selectedEdge.value = null;
      });

      // 监听键盘删除事件
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault(); // 阻止默认的浏览器行为
          if (selectedNode.value) {
            lf.value.deleteNode(selectedNode.value.id);
            selectedNode.value = null;
          } else if (selectedEdge.value) {
            lf.value.deleteEdge(selectedEdge.value.id);
            selectedEdge.value = null;
          }
        }
      });
    });

    // 节点拖拽开始
    const onDragStart = (e, node) => {
      e.preventDefault(); // 阻止默认的拖拽行为
      if (lf.value) {
        // 阻止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        lf.value.dnd.startDrag({
          type: node.type,
          properties: { ...node.properties },
          text: node.label
        });
      }
    };

    // 更新节点文本
    const updateNodeText = () => {
      if (selectedNode.value && lf.value) {
        lf.value.setNodeText(selectedNode.value.id, selectedNode.value.text.value);
      }
    };

    // 更新节点大小
    const updateNodeSize = () => {
      if (selectedNode.value && lf.value) {
        const node = { ...selectedNode.value };
        
        if (node.type === 'circle') {
          lf.value.updateNode(node.id, { 
            r: node.r 
          });
        } else {
          lf.value.updateNode(node.id, { 
            width: node.width, 
            height: node.height 
          });
        }
      }
    };

    // 更新节点样式
    const updateNodeStyle = () => {
      if (selectedNode.value && lf.value) {
        const node = { ...selectedNode.value };
        lf.value.updateNodeProperties(node.id, {
          fill: node.properties.color
        });
      }
    };

    // 更新边文本
    const updateEdgeText = () => {
      if (selectedEdge.value && lf.value) {
        lf.value.setEdgeText(selectedEdge.value.id, selectedEdge.value.text.value);
      }
    };

    // 更新边样式
    const updateEdgeStyle = () => {
      if (selectedEdge.value && lf.value) {
        const edge = { ...selectedEdge.value };
        const style = {};
        
        if (edge.properties.lineStyle) {
          style.strokeDasharray = edge.properties.lineStyle === 'dashed' ? '5 5' : 
                                  edge.properties.lineStyle === 'dotted' ? '2 2' : '';
        }
        
        if (edge.properties.lineWidth) {
          style.strokeWidth = edge.properties.lineWidth;
        }
        
        if (edge.properties.color) {
          style.stroke = edge.properties.color;
        }
        
        lf.value.updateEdgeProperties(edge.id, { style });
      }
    };

    // 撤销
    const handleUndo = () => {
      if (lf.value && canUndo.value) {
        lf.value.undo();
      }
    };

    // 重做
    const handleRedo = () => {
      if (lf.value && canRedo.value) {
        lf.value.redo();
      }
    };

    // 放大
    const handleZoomIn = () => {
      if (lf.value) {
        const zoomInfo = lf.value.getTransform();
        const nextScale = zoomInfo.SCALE * 1.1;
        lf.value.zoom(nextScale);
      }
    };

    // 缩小
    const handleZoomOut = () => {
      if (lf.value) {
        const zoomInfo = lf.value.getTransform();
        const nextScale = zoomInfo.SCALE * 0.9;
        lf.value.zoom(nextScale);
      }
    };

    // 重置缩放
    const handleResetZoom = () => {
      if (lf.value) {
        lf.value.resetTransform();
        lf.value.fitView();
      }
    };

    // 清空画布
    const handleClear = () => {
      if (lf.value) {
        lf.value.clearData();
        selectedNode.value = null;
        selectedEdge.value = null;
      }
    };

    // 加载流程图数据
    const loadFlowData = (data) => {
      if (lf.value && data) {
        try {
          // 清空当前画布
          lf.value.clearData();
          
          // 渲染流程图数据
          lf.value.render(data);
          
          // 适应画布
          lf.value.fitView();
          
          return true;
        } catch (error) {
          console.error('Failed to load flow data:', error);
          return false;
        }
      }
      return false;
    };

    // 导入流程图
    const handleImport = () => {
      importDialogVisible.value = true;
      importJson.value = '';
      importFile.value = null;
      importType.value = 'json';
    };

    // 处理文件上传
    const handleFileChange = (file) => {
      importFile.value = file.raw;
    };

    // 确认导入
    const confirmImport = async () => {
      if (lf.value) {
        try {
          let importData = null;
          
          if (importType.value === 'json' && importJson.value) {
            // 从JSON字符串导入
            importData = JSON.parse(importJson.value);
          } else if (importType.value === 'file' && importFile.value) {
            // 从文件导入
            const content = await readFile(importFile.value);
            importData = JSON.parse(content);
          }
          
          if (importData) {
            lf.value.render(importData);
            importDialogVisible.value = false;
          } else {
            this.$message.error('导入数据为空');
          }
        } catch (error) {
          this.$message.error('导入失败: ' + error.message);
        }
      }
    };

    // 读取文件内容
    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    };

    // 导出流程图
    const handleExport = () => {
      if (lf.value) {
        const data = lf.value.getGraphData();
        const dataStr = JSON.stringify(data, null, 2);
        
        // 创建下载链接
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接并触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = `flow_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    // 保存流程图
    const handleSave = () => {
      saveDialogVisible.value = true;
      saveForm.name = saveForm.name || `流程图_${new Date().getTime()}`;
    };

    // 确认保存
    const confirmSave = () => {
      if (lf.value) {
        const data = lf.value.getGraphData();
        
        // 创建保存对象
        const saveData = {
          name: saveForm.name,
          description: saveForm.description,
          data: data,
          createdAt: new Date().toISOString()
        };
        
        // 发送保存事件
        emit('save', saveData);
        
        // 关闭对话框
        saveDialogVisible.value = false;
        
        // 提示保存成功
        this.$message.success('保存成功');
      }
    };

    // 更新节点描述
    const updateNodeDescription = () => {
      if (selectedNode.value && lf.value) {
        const node = { ...selectedNode.value };
        lf.value.updateNodeProperties(node.id, {
          description: node.properties.description
        });
      }
    };

    // 更新节点属性
    const updateNodeProperties = () => {
      if (selectedNode.value && lf.value) {
        const node = { ...selectedNode.value };
        lf.value.updateNodeProperties(node.id, node.properties);
      }
    };

    // 在组件卸载时移除事件监听
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });

    return {
      container,
      canUndo,
      canRedo,
      selectedNode,
      selectedEdge,
      nodeList,
      importDialogVisible,
      saveDialogVisible,
      importType,
      importJson,
      saveForm,
      onDragStart,
      updateNodeText,
      updateNodeDescription,
      updateNodeSize,
      updateNodeStyle,
      updateEdgeText,
      updateEdgeStyle,
      handleUndo,
      handleRedo,
      handleZoomIn,
      handleZoomOut,
      handleResetZoom,
      handleClear,
      handleImport,
      handleExport,
      handleSave,
      handleFileChange,
      confirmImport,
      confirmSave,
      loadFlowData,
      updateNodeProperties
    };
  }
};
</script>

<style scoped>
.flow-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-left > * {
  margin-right: 10px;
}

.action-button {
  margin-right: 8px;
}

.button-group {
  display: flex;
}

.editor-container {
  display: flex;
  flex: 1;
  height: calc(100% - 55px);
  overflow: hidden;
}

.node-panel {
  width: 200px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 12px 16px;
  font-weight: bold;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s;
}

.node-item:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
}

.node-item i {
  margin-right: 8px;
  font-size: 18px;
}

.canvas-container {
  flex: 1;
  position: relative;
}

#flow-canvas {
  width: 100%;
  height: 100%;
}

.properties-panel {
  width: 280px;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.el-divider--vertical {
  height: 24px;
  margin: 0 12px;
}

/* 确保图标和文字对齐 */
.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.el-button .el-icon {
  margin-right: 4px;
}

/* 上传相关样式 */
.upload-demo {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
}
</style> 