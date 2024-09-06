<template>
  <div class="flow-edit">
    <div class="flow-edit-top" :style="{ height: isFold ? '48px' : '96px' }">
      <div class="flow-edit-top-left">
        <div class="left-option">
          <span class="left-option-label">流程名称:</span>
          <a-input
            type="text"
            v-model:value="flowName"
            placeholder="请输入"
            class="left-option-input name"
            allow-clear
            :disabled="checkType === 'check'"
          />
        </div>
        <div class="left-option">
          <span class="left-option-label">流程描述:</span>
          <a-input
            type="text"
            v-model:value="flowDesc"
            placeholder="请输入"
            allow-clear
            class="left-option-input desc"
            :disabled="checkType === 'check'"
          />
        </div>
        <div class="left-option" v-show="!isFold">
          <span class="left-option-label">定时执行计划:</span>
          <a-radio-group
            v-model:value="radioValue"
            class="left-option-input radio"
            :disabled="checkType === 'check'"
          >
            <a-radio :value="1" class="radio-item">定时任务</a-radio>
            <a-radio :value="2" class="radio-item" disabled>事件触发</a-radio>
          </a-radio-group>
        </div>
        <div class="left-option" v-show="!isFold">
          <span class="left-option-label">生效时间:</span>
          <a-range-picker
            v-model:value="effectTime"
            class="left-option-input range"
            :disabled="checkType === 'check'"
          >
            <template #suffixIcon>
              <SmileOutlined />
            </template>
          </a-range-picker>
        </div>
        <div class="left-option" v-show="!isFold">
          <span class="left-option-label">检测周期:</span>
          <a-input-number
            v-model:value="checkCycle"
            :min="1"
            placeholder="请输入"
            class="left-option-input number"
            :disabled="checkType === 'check'"
          />
          <a-select
            v-model:value="checkUnit"
            :options="unitOptions"
            class="left-option-input select"
            :disabled="checkType === 'check'"
          />
        </div>
      </div>
      <div class="flow-edit-top-right">
        <a-button
          @click="handleReturn"
          class="flow-edit-top-right-btn"
          v-show="checkType !== 'add'"
        >
          返回
        </a-button>
        <!-- <div class="flow-edit-top-right-btn" v-if="isFold" @click="handleFold">
          展开
          <double-right-outlined :rotate="90" />
        </div>
        <div class="flow-edit-top-right-btn" v-else @click="handleFold">
          收起
          <double-left-outlined :rotate="90" />
        </div> -->
      </div>
    </div>
    <div
      class="flow-edit-content"
      :style="{ height: isFold ? 'calc(100% - 100px)' : 'calc(100% - 148px)' }"
    >
      <div class="flow-edit-content-left">
        <!-- <a-input-search
          v-model:value="searchValue"
          placeholder="请输入流程关键字"
          class="left-search"
          @search="onSearch"
        /> -->
        <CategoryTree :isNodeShow="true" ref="categoryTree" />
      </div>
      <FlowGraph
        ref="flowGraph"
        :graphData="initGraphData"
        :checkType="checkType"
        parentType="flow"
        className="flow-edit-content-graph"
        @handleInputList="handleInputList"
        @handleChangeIsRightPartShow="handleChangeIsRightPartShow"
      />
      <div
        :class="['flow-edit-content-right', isRightPartShow ? 'show' : 'hide']"
      >
        <div class="right-header">组件参数</div>
        <div class="right-content">
          <div
            class="right-content-item"
            v-for="item in inputList"
            :key="item.id"
          >
            <div class="right-content-item-label">
              <i class="required" v-show="item.required">*</i>
              {{ item.title }}:
            </div>
            <!-- item.type：1、文本框; 2、文本域; 3: 下拉框，4、时间 -->
            <a-input
              type="text"
              allow-clear
              v-if="item.type === 1"
              v-model:value="item.value"
              placeholder="请输入"
              class="right-content-item-input"
              :disabled="checkType === 'check'"
            />
            <a-textArea
              allow-clear
              v-else-if="item.type === 2"
              v-model:value="item.value"
              placeholder="请输入"
              :auto-size="{ minRows: 4, maxRows: 4 }"
              class="right-content-item-input"
              :disabled="checkType === 'check'"
            />
            <a-select
              allow-clear
              v-else-if="item.type === 3"
              v-model:value="item.value"
              placeholder="请输入"
              :options="item.options"
              :fieldNames="{
                label: 'label',
                value: 'enum',
              }"
              class="right-content-item-input"
              :disabled="checkType === 'check'"
            />
            <a-date-picker
              v-else-if="item.type === 4"
              v-model:value="item.value"
              placeholder="请选择"
              class="right-content-item-input"
              :disabled="checkType === 'check'"
            >
              <template #suffixIcon>
                <SmileOutlined />
              </template>
            </a-date-picker>
          </div>
        </div>
        <div class="right-footer" v-show="checkType !== 'check'">
          <a-button @click="handleResetDetail" class="right-footer-button">
            重置
          </a-button>
          <a-button
            type="primary"
            @click="handleSaveDetail"
            class="right-footer-button"
          >
            保存
          </a-button>
        </div>
      </div>
    </div>
    <div class="flow-edit-footer">
      <a-button
        @click="handleReset"
        class="footer-button"
        v-show="checkType !== 'check'"
      >
        重置
      </a-button>
      <a-button
        type="primary"
        @click="handleSave"
        class="footer-button"
        v-show="checkType !== 'check'"
      >
        保存
      </a-button>
      <a-button
        type="primary"
        @click="handlePublish"
        class="footer-button"
        v-show="checkType === 'check'"
      >
        发布
      </a-button>
    </div>
  </div>
</template>

<script>
  import CategoryTree from "@/components/CategoryTree";
  import { createFlow } from "@/shared/api/flowEdit";
  import { executeFlow } from "@/shared/api/flowManage";
  import {
    Button,
    DatePicker,
    Input,
    InputNumber,
    Radio,
    Select,
    Tabs,
    message,
  } from "ant-design-vue";
  import dayjs from "dayjs";
  import { reactive, ref, toRefs } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import FlowGraph from "./components/flowGraph";

  const { Group } = Radio;
  const { RangePicker, TimePicker } = DatePicker;
  const { Search, TextArea } = Input;
  const { TabPane } = Tabs;

  export default {
    name: "FlowEdit",
    components: {
      AButton: Button,
      ADatePicker: DatePicker,
      AInput: Input,
      AInputNumber: InputNumber,
      AInputSearch: Search,
      ARadio: Radio,
      ARadioGroup: Group,
      ARangePicker: RangePicker,
      ASelect: Select,
      ATabs: Tabs,
      ATabPane: TabPane,
      ATextArea: TextArea,
      ATimePicker: TimePicker,
      CategoryTree,
      FlowGraph,
    },
    setup() {
      const router = useRouter();
      const store = useStore();
      const details = store.state.flowDetails;
      // 顶部详情输入框
      const flowParams =
        (details && details.flowParams) ||
        reactive({
          flowName: "",
          flowDesc: "",
          radioValue: 1,
          effectTime: [],
          checkCycle: undefined,
          checkUnit: 0,
        });
      const initGraphData = details.graphData; // 初始流程图数据
      const checkType = (details && details.checkType) || ref("add");
      store.commit("setFlowDetails", {}); // 获取完之后重置掉，很重要！！

      let unitOptions = ref([
        {
          label: "天",
          value: 0,
        },
        // {
        //   label: "周",
        //   value: "2",
        // },
        {
          label: "月",
          value: 1,
        },
      ]);
      let isFold = ref(false);
      let flowGraph = ref(null);

      // 展开收起方法
      const handleFold = () => {
        isFold.value = !isFold.value;
      };

      // 返回方法
      const handleReturn = () => {
        router.back(-1);
      };

      // 左侧菜单栏
      let searchValue = ref(undefined);

      // 搜索框方法
      const onSearch = (value) => {
        searchValue.value = value;
      };

      const categoryTree = ref(null);

      // 右侧数据
      let rightInputData = reactive({
        inputList: [],
      });
      let isRightPartShow = ref(false); // 右侧区域是否展示

      // 修改inputList方法
      const handleInputList = (data) => {
        rightInputData.inputList = data;
      };

      // 修改isRightPartShow的方法
      const handleChangeIsRightPartShow = (value) => {
        isRightPartShow.value = value;
      };

      // 右侧footer方法
      const handleResetDetail = () => {
        rightInputData.inputList.map((item) => {
          item.value = undefined;
        });
      };

      // 校验inputList
      const chechInputList = (arr) => {
        // arr = flowGraph.value.selectedNode.data.data.inputList;
        let checkFlag = true; // inputList是否校验通过
        let info = "";
        for (let i = 0; i < arr.length; i++) {
          const element = arr[i];
          if (element.required && !element.value) {
            info = `${element.title}为必填项，但没有值，保存失败！`;
            checkFlag = false;
            break;
          }
        }
        return { checkFlag, info };
      };
      const handleSaveDetail = () => {
        const { checkFlag, info } = chechInputList(rightInputData.inputList);
        if (!checkFlag) {
          return message.error(info);
        }
        message.success("组件参数保存成功！");
        const handleSaveNodeData = flowGraph.value.handleSaveNodeData;
        // 调用flowGraph的handleSaveNodeData方法保存组件的参数数据
        handleSaveNodeData(rightInputData.inputList);
      };

      // footer重置按钮
      const handleReset = () => {
        flowParams.flowName = "";
        flowParams.flowDesc = "";
        flowParams.radioValue = 1;
        flowParams.effectTime = [];
        flowParams.checkCycle = undefined;
        flowParams.checkUnit = 0;
      };

      // footer保存按钮
      const handleSave = async () => {
        // 图谱数据
        const graphData = flowGraph.value.getGraphData();
        const graph = flowGraph.value.getGraph(); // 流程图的实例对象
        const rootNodes = graph.getRootNodes(); // 获取图谱的根组件（入度为0的组件）
        if (!flowParams.flowName) {
          return message.error("请输入流程名称！");
        }
        if (flowParams.flowName.length > 50) {
          return message.error("流程名称长度不能超过50！");
        }
        if (flowParams.flowDesc.length > 200) {
          return message.error("流程名称长度不能超过200！");
        }
        if (!flowParams.effectTime.length) {
          return message.error("请选择生效时间！");
        }
        if (!flowParams.checkCycle) {
          return message.error("请输入检测周期！");
        }
        if (flowParams.checkCycle > 99999999999) {
          return message.error("检测周期长度不能超过11！");
        }
        if (!graphData.cells.length) {
          return message.error("暂无可保存的流程图！");
        }
        if (rootNodes.length < 1) {
          return message.error("图中没有根组件，请检查！");
        }
        if (rootNodes.length > 1) {
          return message.error("图中不止一个根组件，请检查！");
        }

        const nodes = getGraphJsonData(rootNodes, graph);
        if (!nodes) return;
        const json = {
          id: checkType === "edit" ? details.id : undefined,
          chainName: flowParams.flowName,
          desc: flowParams.flowDesc,
          runMode: flowParams.radioValue,
          startDate: dayjs(flowParams.effectTime[0]).format("YYYY-MM-DD"),
          endDate: dayjs(flowParams.effectTime[1]).format("YYYY-MM-DD"),
          elLayout: JSON.stringify(graphData.cells),
          checkDate: flowParams.checkCycle,
          cycleUnit: flowParams.checkUnit,
          nodes,
        };
        const res = await createFlow(json);
        if (res.message === "成功") {
          message.success("保存成功！");
          router.push(`/flow-manage`);
        } else {
          message.error(res.message);
        }
      };

      // 生成json数据里nodes的嵌套数据
      const getGraphJsonData = (nodes, graph) => {
        const result = [];
        let flag = true; // 校验是否通过
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const outNodes = graph.getNeighbors(node, { outgoing: true });
          let child = [];
          if (node.data.hasRequiredInput) {
            const { checkFlag } = chechInputList(node.data.inputList);
            flag = checkFlag;
            if (!checkFlag) {
              message.error(
                `${node.data.label} 含有未填写的必填项参数，请检查！`
              );
              break;
            }
          }
          child = getGraphJsonData(outNodes, graph);
          if (!child) {
            flag = false;
          }
          result.push({
            elType: node.data.elType,
            nodeId: node.data.key,
            nodeCode: node.data.code,
            nodeName: node.data.label,
            type: categoryTree.value.activeKey, // 组件类型(1:普通任务组件,2:脚本任务组件)
            nodeCategory: node.data.nodeCategory,
            nodeProps:
              (node.data.inputList &&
                node.data.inputList.map((item) => ({
                  proName: item.title,
                  proCode: item.id,
                  proType: item.type,
                  proValue: item.value,
                  //proRequired: item.required ? 0 : 1,
                  proRequired: item.required ? 1 : 0,
                }))) ||
              [],
            child,
            tag: node.data.tag,
          });
        }
        if (flag) {
          return result;
        } else {
          return false;
        }
      };

      // 发布按钮
      const handlePublish = async () => {
        const loading = message.loading("正在操作", 0);
        const res = await executeFlow(details.id);
        loading();
        if (res.message === "成功") {
          message.success("执行成功！");
        } else {
          message.error(res.message);
        }
      };

      return {
        ...toRefs(flowParams),
        checkType,
        unitOptions,
        isFold,
        handleFold,
        handleReturn,

        searchValue,
        categoryTree,
        onSearch,

        ...toRefs(rightInputData),
        flowGraph,
        initGraphData,
        isRightPartShow,
        handleChangeIsRightPartShow,
        handleInputList,
        handleResetDetail,
        handleSaveDetail,

        handleReset,
        handleSave,
        handlePublish,
      };
    },
  };
</script>

<style lang="less">
  .flow-edit {
    width: 100%;
    height: 100%;
    background: #ffffff;
    box-shadow: 0px 2px 8px rgba(31, 48, 78, 0.05),
      0px 10px 16px 4px rgba(31, 48, 78, 0.04);
    border-radius: 6px;
    padding: 16px 16px 0;
    display: flex;
    flex-direction: column;

    &-top {
      position: relative;
      transition: all 0.3s;

      &-left {
        width: 1124px;
        display: flex;
        flex-wrap: wrap;
        transition: all 0.3s;

        .left-option {
          height: 32px;
          display: flex;
          margin-right: 56px;
          margin-bottom: 16px;
          align-items: center;

          &:nth-child(3) {
            .left-option-label {
              width: 98px;
            }
          }

          &-label {
            width: 70px;
            margin-right: 8px;
            line-height: 32px;
          }

          &-input {
            height: 32px;
            line-height: 32px;

            &.name {
              width: 210px;
            }

            &.desc {
              width: 646px;
            }

            &.radio {
              width: 182px;

              .radio-item {
                margin: 0;
                line-height: 32px;

                &:first-child {
                  margin-right: 6px;
                }
              }
            }

            &.range {
              width: 256px;
            }

            &.number {
              width: 132px;
              margin-right: 4px;
            }

            &.select {
              width: 120px;
            }
          }
        }
      }

      &-right {
        top: 0;
        right: 0;
        cursor: pointer;
        color: #1776ff;
        position: absolute;
      }
    }

    &-content {
      flex: 1;
      display: flex;
      transition: all 0.3s;
      border: 1px solid #d6dbe3;

      &-left {
        width: 288px;
        height: 100%;
        padding: 0 16px 16px;
        border-right: 1px solid #d6dbe3;

        .left-search {
          margin-bottom: 16px;

          .ant-input {
            border-radius: 6px 0 0 6px;

            &:focus {
              box-shadow: none;
            }
          }

          .ant-input-group-addon {
            .ant-btn {
              border-radius: 0 6px 6px 0 !important;
              border-left: 0;
              color: #97a3b7 !important;
            }
          }
        }
      }

      &-graph {
        flex: 1;
        position: relative;
        width: calc(100% - 576px);
      }

      &-right {
        height: 100%;
        padding: 16px;
        transition: all 0.3s;
        border-left: 1px solid #d6dbe3;

        &.show {
          width: 288px;
          opacity: 1;
        }

        &.hide {
          width: 0;
          opacity: 0;
          padding: 0;
          margin: 0;
          border: none;
        }

        .right-header {
          height: 22px;
          font-weight: 600;
          color: #3c485c;
          line-height: 22px;
          margin-bottom: 16px;
        }

        .right-content {
          overflow-y: auto;
          height: calc(100% - 86px);

          &-item {
            margin-bottom: 16px;
            padding-right: 16px;

            &-label {
              height: 20px;
              color: #3c485c;
              line-height: 20px;
              margin-bottom: 4px;
            }

            &-input {
              width: 100%;
            }
          }
        }

        .right-footer {
          display: flex;
          height: 48px;
          padding-top: 16px;
          justify-content: flex-end;

          &-button {
            margin-left: 8px;
          }
        }
      }
    }

    &-footer {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .footer-button {
        margin-left: 8px;
      }
    }
  }
</style>
