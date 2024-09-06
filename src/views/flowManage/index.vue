<template>
  <TableList
    :title="title"
    :columns="columns"
    :dataSource="dataSource"
    :pagination="pagination"
    :loading="searchLoading"
  >
    <template #searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">流程名称：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          v-model:value.trim="flowName"
          placeholder="请输入"
          allow-clear
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">状态：</span>
        <a-select
          allow-clear
          v-model:value="flowStatus"
          placeholder="请选择"
          class="table-list-top-item-select"
        >
          <a-select-option value="0">草稿</a-select-option>
          <a-select-option value="1">上线</a-select-option>
        </a-select>
      </div>

      <div class="table-list-top-item btns">
        <div class="btns-left">
          <a-button type="primary" @click="onSearch('init')">查询</a-button>
          <a-button @click="onReset">重置</a-button>
        </div>
        <div class="btns-right">
          <a-button type="primary" @click="addFlow">新增</a-button>
        </div>
      </div>
    </template>

    <template #action="{ record }">
      <a-tooltip placement="top" title="查看">
        <icon-svg
          className="action-img"
          icon-class="action-check"
          @click="handleCheck(record)"
        />
      </a-tooltip>
      <a-divider type="vertical" />
      <a-tooltip placement="top" title="编辑">
        <edit-outlined
          :class="['action-img', record.status === 1 ? 'disabled' : '']"
          @click="handleEdit(record)"
        />
      </a-tooltip>
      <a-divider type="vertical" />
      <a-tooltip placement="top" title="发布">
        <icon-svg
          :className="['action-img', record.status === 1 ? 'disabled' : '']"
          icon-class="action-publish"
          @click="showParamModal(record)"
        />
      </a-tooltip>
      <a-divider type="vertical" />
      <a-tooltip placement="top" title="停用">
        <icon-svg
          :className="['action-img', record.status === 0 ? 'disabled' : '']"
          icon-class="action-stop"
          @click="updateFlowStatus(record, '0')"
        />
      </a-tooltip>
      <a-divider type="vertical" />
      <a-tooltip placement="top" title="立即执行">
        <icon-svg
          :className="['action-img', record.status === 0 ? 'disabled' : '']"
          icon-class="action-execute"
          @click="handleExecute(record)"
        />
      </a-tooltip>
    </template>
    <template #status="{ text }">
      <span v-if="text === 1">
        <img
          class="status-img"
          src="@/assets/images/img/status-online.svg"
          alt=""
        />
        上线
      </span>
      <span v-else>
        <img
          class="status-img"
          src="@/assets/images/img/status-draft.svg"
          alt=""
        />
        草稿
      </span>
    </template>
  </TableList>
  <a-modal
    v-model:visible="isPublishModalShow"
    title="流程参数列表"
    @ok="onConfirm"
    centered
    :maskClosable="false"
    width="1200px"
    class="publish-modal"
  >
    <div class="publish-modal-content">
      <div class="content-detail">
        <div class="content-detail-item">
          <span class="content-detail-item-label">流程名称：</span>
          <a-input
            class="content-detail-item-value"
            v-model:value="detailFlowName"
            placeholder="流程名称"
          />
        </div>
        <div class="content-detail-item">
          <a-checkbox
            class="content-detail-item-value"
            v-model:checked="isNew"
            @change="handleCheckNew"
          />
          是否作为新流程发布
        </div>
        <div class="content-detail-item">
          <span class="content-detail-item-label">流程描述：</span>
          <a-input
            class="content-detail-item-value"
            v-model:value="detailFlowDesc"
            placeholder="流程描述"
          />
        </div>
      </div>
      <a-table
        class="content-table"
        :dataSource="paramList"
        :columns="paramColumns"
        :pagination="false"
        :scroll="{ y: '400px' }"
        :rowKey="(record) => record.index"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'paramValue'">
            <span v-if="record.useParam">{{ record.paramValue }}</span>
            <a-input
              v-else
              type="text"
              class="content-table-item-input"
              v-model:value="paramList[index][column.key]"
              placeholder="请输入"
              allow-clear
            />
          </template>
          <template v-if="column.key === 'useParam'">
            <a-checkbox
              :checked="paramList[index][column.key]"
              @change="handleCheckParam(record, index, $event)"
            />
          </template>
          <template v-if="column.key === 'desc'">
            <a-input
              v-if="record.useParam"
              type="text"
              class="content-table-item-input"
              v-model:value.trim="paramList[index][column.key]"
              placeholder="请输入"
              allow-clear
            />
            <span v-else>{{ record.desc }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script>
  import TableList from "@/components/TableList";
  import {
    executeFlow,
    publishChain,
    queryChainDetails,
    queryChainList,
    updateChainStatus,
    viewChainSchema,
  } from "@/shared/api/flowManage";
  import {
    Button,
    Checkbox,
    Divider,
    Input,
    Modal,
    Select,
    Table,
    Tooltip,
    message,
  } from "ant-design-vue";
  import dayjs from "dayjs";
  import { find } from "lodash";
  import { onMounted, reactive, ref, toRefs } from "vue";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";

  export default {
    name: "FlowManage",
    components: {
      AInput: Input,
      AButton: Button,
      ACheckbox: Checkbox,
      ADivider: Divider,
      AModal: Modal,
      ATable: Table,
      ATooltip: Tooltip,
      ASelect: Select,
      ASelectOption: Select.Option,
      TableList,
    },
    setup() {
      const router = useRouter();
      const store = useStore();

      const title = ref("流程列表");
      let searchLoading = ref(false);
      const searchParams = reactive({
        flowName: undefined,
        flowStatus: undefined,
      });

      // 搜索
      const onSearch = (type) => {
        if (type === "init") {
          pagination.current = 1;
        }
        getFlowList();
      };

      // 重置
      const onReset = () => {
        searchParams.flowName = undefined;
        searchParams.flowStatus = undefined;
        onSearch("init");
      };

      const columns = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 80,
        },
        {
          title: "流程名称",
          dataIndex: "flowName",
          key: "flowName",
          width: 365,
        },
        {
          title: "创建时间",
          dataIndex: "createdTime",
          key: "createdTime",
          width: 365,
          // sorter: true,
        },
        {
          title: "状态",
          key: "status",
          dataIndex: "status",
          width: 200,
        },
        {
          title: "操作",
          key: "action",
          dataIndex: "action",
          width: 200,
          fixed: "right",
        },
      ];
      const dataSource = ref([]);
      const pagination = reactive({
        size: "small",
        total: 0,
        current: 1,
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
        showTotal: (total, current) => {
          return `共${total}条记录，当前第${Math.ceil(
            current[0] / pagination.pageSize
          )}页`;
        },
        onChange: (page, pageSize) => {
          pagination.current = page;
          pagination.pageSize = pageSize;
          onSearch("repeat");
        },
        onShowSizeChange: (current, size) => {
          pagination.current = current;
          pagination.pageSize = size;
          onSearch("repeat");
        },
      });

      // 修改状态，点击发布或停用
      const updateFlowStatus = async (record, status) => {
        if (record.status == status) {
          return false;
        }
        const json = {
          id: record.id,
          chainStatus: status,
        };
        const res = await updateChainStatus(json);
        if (res.message === "成功") {
          onSearch("repeat");
        } else {
          message.error(res.message);
        }
      };

      // 新增
      const addFlow = () => {
        router.push(`/flow-edit`);
      };

      // 获取列表数据
      const getFlowList = async () => {
        searchLoading.value = true;
        const json = {
          chainStatus: searchParams.flowStatus,
          chainName: searchParams.flowName,
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        };
        const res = await queryChainList(json);
        searchLoading.value = false;
        if (res.message === "成功" && res.data.dateList) {
          dataSource.value = res.data.dateList.map((item, index) => {
            return {
              ...item,
              index: (pagination.current - 1) * pagination.pageSize + index + 1,
              flowName: item.chainName,
              createdTime: item.createDate,
              status: item.chainStatus,
            };
          });

          pagination.current = res.data.pageNo;
          pagination.total = res.data.totalCount;
        } else {
          message.error(res.message);
        }
      };

      // 查看流程详情
      const handleCheck = async (record) => {
        const details = await getFlowDetails(record.id, "check");
        if (details) {
          store.commit("setFlowDetails", details);
          router.push("/flow-edit");
        }
      };
      // 编辑流程
      const handleEdit = async (record) => {
        if (record.status === 1) return;
        const details = await getFlowDetails(record.id, "edit");
        if (details) {
          store.commit("setFlowDetails", details);
          router.push("/flow-edit");
        }
      };

      // 获取流程详情
      const getFlowDetails = async (id, checkType) => {
        const loading = message.loading("正在获取流程详情", 0);
        const res = await queryChainDetails(id);
        loading();
        if (res.message === "成功" || res.data) {
          const details = reactive({
            flowParams: {
              flowName: res.data.chainName,
              flowDesc: res.data.desc,
              radioValue: res.data.runMode,
              effectTime: [dayjs(res.data.createDate), dayjs(res.data.endDate)],
              checkCycle: res.data.checkDate,
              checkUnit: res.data.cycleUnit,
            },
            // 兼容老的流程图数据
            graphData: Array.isArray(JSON.parse(res.data.elLayout))
              ? {
                  cells: JSON.parse(res.data.elLayout),
                }
              : JSON.parse(res.data.elLayout),
            checkType,
            id,
          });
          return details;
        } else if (res.message === "成功" && !res.data) {
          message.info("暂无该流程详情信息！");
          return false;
        } else {
          message.error(res.message);
          return false;
        }
      };

      // 立即执行
      const handleExecute = async (record) => {
        if (record.status === 0) return;
        const loading = message.loading("正在操作", 0);
        const res = await executeFlow(record.id);
        loading();
        if (res.message === "成功") {
          message.success("执行成功！");
        } else if (res.code === 5000) {
          message.error(res.data.error);
        } else {
          message.error(res.message);
        }
      };

      const publishParams = reactive({
        detailFlowName: undefined, // 当前流程名称
        oldFlowName: undefined, // 原流程名称
        detailFlowDesc: undefined, // 当前流程描述
        oldFlowDesc: undefined, // 原流程描述
        isNew: false, // 是否作为新流程发布
        isPublishModalShow: false, // 发布弹窗是否展示
        paramColumns: [
          {
            title: "节点名称",
            key: "nodeName",
            dataIndex: "nodeName",
            width: 150,
          },
          {
            title: "参数名称",
            dataIndex: "paramName",
            key: "paramName",
            width: 200,
          },
          {
            title: "参数值",
            dataIndex: "paramValue",
            key: "paramValue",
            width: 330,
          },
          {
            title: "是否暴露参数",
            dataIndex: "useParam",
            key: "useParam",
            width: 140,
          },
          {
            title: "描述",
            dataIndex: "desc",
            key: "desc",
            width: 327,
          },
        ],
        paramList: [],
        checkDetail: {},
        noParamList: [], // 存放没有参数的节点
      });

      // 点击是否勾选作为新流程发布
      const handleCheckNew = (e) => {
        console.log("handleCheckNew", e);
        publishParams.isNew = e.target.checked;
        if (e.target.checked) {
          publishParams.detailFlowName = "";
          publishParams.detailFlowDesc = "";
        } else {
          publishParams.detailFlowName = publishParams.oldFlowName;
          publishParams.detailFlowDesc = publishParams.oldFlowDesc;
        }
      };

      // 点击是否暴露参数
      const handleCheckParam = (record, index, e) => {
        console.log("handleCheckParam", record, e);
        const target = publishParams.paramList[index];
        if (e.target.checked) {
          if (target.proRequired && !target.paramValue) {
            return message.warning(`${target.paramName}参数的参数值为必填项！`);
          }
          target.required.push(record.paramName);
        } else {
          const num = target.required.indexOf(record.paramName);
          target.required.splice(num, 1);
        }
        target.useParam = e.target.checked;
      };

      // 点击展示发布详情
      const showParamModal = async (record) => {
        if (record.status === 1) return;
        const loading = message.loading("正在加载", 0);
        publishParams.checkDetail = record;
        const res = await viewChainSchema(record.id);
        publishParams.noParamList = []; // 重置
        loading();
        if (res.message === "成功") {
          publishParams.detailFlowName = res.data.name;
          publishParams.oldFlowName = res.data.name;
          publishParams.detailFlowDesc = res.data.description;
          publishParams.oldFlowDesc = res.data.description;
          publishParams.paramList = [];
          res.data.parameter.map((item) => {
            const keys = Object.keys(item.arg);
            console.log("keys", keys);
            if (!keys.length) {
              publishParams.noParamList.push(item);
            }
            keys.forEach((v) => {
              const value = item.arg[v];

              publishParams.paramList.push({
                ...item,
                paramName: v,
                proRequired: value.proRequired === 1 ? true : false,
                paramValue: value.defaultValue,
                useParam:
                  item.required && item.required.includes(v) ? true : false,
                desc: value.description || "",
                ...value,
              });
            });
          });
          publishParams.isPublishModalShow = true;
        } else {
          message.error(res.message);
        }
      };

      // 处理paramList
      const handleParamList = () => {
        const arr = [];
        publishParams.paramList.map((item) => {
          const target = find(arr, (v) => v.nodeTag === item.nodeTag);
          if (target) {
            target.arg[item.paramName] = {
              paramName: item.paramName,
              defaultValue: item.paramValue,
              type: item.type,
              description: item.desc,
              paramCsName: item.paramCsName,
              paramId: item.paramId,
              nodeParamId: item.nodeParamId,
            };
          } else {
            arr.push({
              nodeName: item.nodeName,
              nodeType: item.nodeType,
              nodeUsage: item.nodeUsage,
              nodeTag: item.nodeTag,
              required: item.required,
              arg: {
                [item.paramName]: {
                  defaultValue: item.paramValue,
                  type: item.type,
                  description: item.desc,
                  paramCsName: item.paramCsName,
                  paramId: item.paramId,
                  nodeParamId: item.nodeParamId,
                },
              },
            });
          }
        });
        return arr;
      };

      const onConfirm = async () => {
        if (publishParams.isNew && !publishParams.detailFlowName) {
          return message.warning("请输入流程名称！");
        }
        for (let i = 0; i < publishParams.paramList.length; i++) {
          const element = publishParams.paramList[i];
          if (element.proRequired && !element.paramValue) {
            return message.warning(
              `${element.paramName}参数的参数值为必填项！`
            );
          }
          if (element.useParam && !element.desc) {
            return message.warning(`请填写${element.paramName}的描述信息！`);
          }
        }
        const arr = handleParamList(publishParams.paramList);
        console.log("arr", arr);
        const json = {
          chainId: publishParams.checkDetail.id,
          schema: {
            name: publishParams.oldFlowName,
            description: publishParams.oldFlowDesc,
            parameter: [...arr, ...publishParams.noParamList],
          },
          chainName: publishParams.detailFlowName,
          description: publishParams.detailFlowDesc,
          isNewChain: publishParams.isNew,
        };
        const loading = message.loading("正在操作", 0);
        const res = await publishChain(json);
        loading();
        if (res.message === "成功") {
          message.success("操作成功");
          publishParams.isPublishModalShow = false;
          getFlowList();
        } else {
          message.error(res.message);
        }
      };

      // mounted
      onMounted(() => {
        getFlowList();
      });

      return {
        title,
        columns,
        ...toRefs(searchParams),
        dataSource,
        searchLoading,
        pagination,
        ...toRefs(publishParams),

        onSearch,
        handleCheck,
        handleEdit,
        onReset,
        handleExecute,
        updateFlowStatus,
        addFlow,
        showParamModal,
        onConfirm,
        handleCheckNew,
        handleCheckParam,
      };
    },
  };
</script>

<style lang="less" scoped>
  @import url("./index.less");
</style>
