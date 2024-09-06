<template>
  <TableList
    v-if="!isDetailShow"
    :title="title"
    :columns="columns"
    :dataSource="dataSource"
    :pagination="pagination"
    :loading="searchLoading"
  >
    <template #searchOptions>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">批次号：</span>
        <a-input
          type="text"
          class="table-list-top-item-input"
          v-model:value.trim="jobId"
          placeholder="请输入"
          allow-clear
        />
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">状态：</span>
        <a-select
          allow-clear
          class="table-list-top-item-select"
          v-model:value="jobStatus"
          placeholder="请选择"
        >
          <a-select-option :value="0">执行成功</a-select-option>
          <a-select-option :value="1">执行失败</a-select-option>
          <a-select-option :value="2">正在执行</a-select-option>
          <a-select-option :value="3">挂起中</a-select-option>
        </a-select>
      </div>
      <div class="table-list-top-item">
        <span class="table-list-top-item-label">时间：</span>
        <a-range-picker
          class="table-list-top-item-range"
          v-model:value="jobTime"
        ></a-range-picker>
      </div>
      <div class="table-list-top-item btns">
        <a-button type="primary" @click="onSearch('init')">查询</a-button>
        <a-button @click="onReset">重置</a-button>
      </div>
    </template>

    <template #action="{ record }">
      <a-tooltip placement="top" title="查看运行任务">
        <icon-svg
          className="action-img"
          icon-class="action-check"
          @click="onClick(record)"
        />
      </a-tooltip>
    </template>
    <template #status="{ text }">
      <span v-if="text === 0">
        <img
          class="status-img"
          src="@/assets/images/img/status-online.svg"
          alt=""
        />
        执行成功
      </span>
      <span v-else-if="text === 1">
        <img
          class="status-img"
          src="@/assets/images/img/status-fail.svg"
          alt=""
        />
        执行失败
      </span>
      <span v-else-if="text === 2">
        <img
          class="status-img"
          src="@/assets/images/img/status-executing.svg"
          alt=""
        />
        正在执行
      </span>
      <span v-else>
        <img
          class="status-img"
          src="@/assets/images/img/status-holdon.svg"
          alt=""
        />
        挂起中
      </span>
    </template>
  </TableList>
  <job-details
    v-else
    :details="details"
    :graphData="graphData"
    @detailShowChange="detailShowChange"
  />
</template>

<script>
  import TableList from "@/components/TableList";
  import { getTaskDetails, queryTaskList } from "@/shared/api/jobManage";
  import { resetData } from "@/utils/common";
  import {
    Button,
    DatePicker,
    Divider,
    Input,
    Select,
    Tooltip,
    message,
  } from "ant-design-vue";
  import dayjs from "dayjs";
  import { onMounted, reactive, ref, toRefs } from "vue";
  import JobDetails from "./jobDetails";

  const { Option } = Select;
  const { RangePicker } = DatePicker;

  export default {
    name: "JobManage",
    components: {
      AInput: Input,
      AButton: Button,
      ADivider: Divider,
      ATooltip: Tooltip,
      ASelect: Select,
      ASelectOption: Option,
      ARangePicker: RangePicker,
      TableList,
      JobDetails,
    },
    setup() {
      const title = ref("运行任务列表");
      let searchLoading = ref(false);
      let isDetailShow = ref(false); // 详情页是否展示
      let jobDetails = reactive({
        details: {},
        graphData: {
          cells: [],
        },
      }); // 点击查看任务的详情数据
      const searchParams = reactive({
        jobId: "",
        jobStatus: undefined,
        jobTime: [],
      });
      const columns = [
        {
          title: "序号",
          key: "index",
          dataIndex: "index",
          width: 80,
        },
        {
          title: "流程名称",
          key: "flowName",
          dataIndex: "flowName",
          width: 250,
        },
        {
          title: "批次号",
          key: "jobNumber",
          dataIndex: "jobNumber",
          width: 250,
        },
        {
          title: "执行时间",
          dataIndex: "createdTime",
          key: "createdTime",
          width: 200,
          // sorter: true,
        },
        {
          title: "结束时间",
          dataIndex: "endTime",
          key: "endTime",
          width: 200,
          // sorter: true,
        },
        {
          title: "状态",
          key: "status",
          dataIndex: "status",
          width: 150,
        },
        {
          title: "操作",
          key: "action",
          dataIndex: "action",
          width: 80,
          fixed: "right",
        },
      ];
      const dataSource = ref([
        // {
        //   id: 1,
        //   jobNumber: "YXWR000001",
        //   createdTime: "2023-01-01 12:00:00",
        //   endTime: "2023-01-01 12:00:00",
        //   status: "1",
        // },
        // {
        //   id: 2,
        //   jobNumber: "YXWR000002",
        //   createdTime: "2023-01-01 12:00:00",
        //   endTime: "2023-01-01 12:00:00",
        //   status: "0",
        // },
      ]);
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

      const onSearch = (type) => {
        if (type === "init") {
          pagination.current = 1;
        }
        getJobList();
      };
      // 重置
      const onReset = () => {
        resetData(searchParams);
        searchParams.jobTime = [];
        onSearch("init");
      };

      // 点击查看任务详情
      const onClick = async (record) => {
        const res = await getTaskDetails(record.id);
        if (res.message === "成功" && res.data) {
          jobDetails.details = record;
          detailShowChange(true);
          jobDetails.graphData = Array.isArray(JSON.parse(res.data))
            ? {
                cells: JSON.parse(res.data),
              }
            : JSON.parse(res.data);
        } else {
          message.error("获取流程图信息失败！");
        }
      };

      // 获取任务列表
      const getJobList = async () => {
        console.log("getJobList", searchParams);
        searchLoading.value = true;
        try {
          const json = {
            status: searchParams.jobStatus,
            batchId: searchParams.jobId,
            pageNo: pagination.current,
            pageSize: pagination.pageSize,
            startDate: searchParams.jobTime.length
              ? dayjs(searchParams.jobTime[0]).format("YYYY-MM-DD")
              : null,
            endDate: searchParams.jobTime.length
              ? dayjs(searchParams.jobTime[1]).format("YYYY-MM-DD")
              : null,
          };
          const res = await queryTaskList(json);
          searchLoading.value = false;
          if (res.message === "成功" && res.data.dateList) {
            dataSource.value = res.data.dateList.map((item, index) => {
              return {
                ...item,
                index:
                  (pagination.current - 1) * pagination.pageSize + index + 1,
                flowName: item.chainName,
                jobNumber: item.id,
                createdTime: item.startDate,
                endTime: item.endDate,
                status: item.status, // 0：成功：1：失败 2：正在执行，3：挂起中
                statusText:
                  item.status === 0
                    ? "成功"
                    : item.status === 1
                    ? "失败"
                    : item.status === 2
                    ? "正在执行"
                    : "挂起中",
                // result: JSON.parse(item.res),
                result: item.res,
              };
            });

            pagination.current = res.data.pageNo;
            pagination.total = res.data.totalCount;
          } else {
            message.error(res.message);
          }
        } finally {
          searchLoading.value = false;
        }
      };

      const syntaxHighlight = (json) => {
        // 如果JSON.parse能够转换成功；并且转换后的类型为object 且不等于 null，那么这个字符串就是JSON格式的字符串。
        console.log("test---", JSON.parse(json), JSON.parse(json) == "object");
        if (typeof JSON.parse(json) == "object" && JSON.parse(json) != null) {
          console.log("bingo");
        }
        if (typeof json != "string") {
          json = JSON.stringify(json, undefined, 2);
        }
        json = json
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return json.replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
          function (match) {
            var cls = "number";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "key";
              } else {
                cls = "string";
              }
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return '<span class="' + cls + '">' + match + "</span>";
          }
        );
      };

      // isDetailShow change方法
      const detailShowChange = (value) => {
        isDetailShow.value = value;
      };

      onMounted(() => {
        getJobList();
      });

      return {
        title,
        columns,
        ...toRefs(searchParams),
        dataSource,
        isDetailShow,
        ...toRefs(jobDetails),
        searchLoading,
        pagination,
        onSearch,
        onClick,
        onReset,
        detailShowChange,
      };
    },
  };
</script>

<style lang="less" scoped></style>
