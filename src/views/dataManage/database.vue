<template>
  <div class="data-base">
    <div class="data-base-header">
      <div class="header-text">数据库管理</div>
      <div class="header-options">
        <div class="header-options-item">
          <div class="item-label">数据源名称：</div>
          <a-select
            v-model:value="sourceValue"
            placeholder="请选择"
            class="item-input"
            :options="sourceOptions"
          />
        </div>
        <div class="header-options-item">
          <div class="item-label">数据库名称：</div>
          <a-input
            type="text"
            allow-clear
            v-model:value="baseValue"
            placeholder="请输入"
            class="item-input"
          />
        </div>
        <div class="header-options-item">
          <a-button type="primary" @click="handleSearch" class="item-button">
            查询
          </a-button>
          <a-button @click="handleReset" class="item-button">重置</a-button>
        </div>
      </div>
    </div>
    <DataList
      :isLoading="loading"
      className="data-base-content"
      :dataList="dataList"
      checkType="base"
      @handleAdd="handleAdd"
      @handleEdit="handleEdit"
      @handleSearch="handleSearch"
    />
    <a-pagination
      :size="size"
      class="data-base-pagination"
      v-model:current="current"
      :showQuickJumper="showQuickJumper"
      :showSizeChanger="showSizeChanger"
      :total="total"
      :pageSize="pageSize"
      :pageSizeOptions="pageSizeOptions"
      :showTotal="showTotal"
      @change="onChange"
      @showSizeChange="onShowSizeChange"
    />
    <a-modal
      v-model:visible="dbModalShow"
      :title="modalTitle"
      centered
      width="792px"
      @ok="handleAddDs"
      class="add-db-modal"
      @cancel="handleCancel"
    >
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          数据源名称：
        </div>
        <a-select
          allow-clear
          v-model:value="dsId"
          placeholder="请选择"
          class="content-item-select"
          :options="dsOptions"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          数据库名称：
        </div>
        <a-input
          type="text"
          allow-clear
          v-model:value.trim="addName"
          placeholder="请输入"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">
          <i class="required">*</i>
          验证密码：
        </div>
        <a-input-password
          allow-clear
          v-model:value="password"
          placeholder="请输入"
          autoComplete="new-password"
          class="content-item-input"
        />
      </div>
      <div class="content-item">
        <div class="content-item-label">备注：</div>
        <a-textArea
          allow-clear
          v-model:value="notes"
          placeholder="请输入"
          class="content-item-input"
          :auto-size="{ minRows: 4, maxRows: 4 }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
  import { ref, reactive, toRefs, onMounted } from "vue";
  import {
    Button,
    Input,
    message,
    Pagination,
    Select,
    Modal,
  } from "ant-design-vue";
  import {
    queryDataBaseByPage,
    getDsList,
    operationDatabase,
  } from "@/shared/api/dataManage";
  import { find } from "lodash";
  import { typeOptions } from "@/shared/data/dataSource";
  import DataList from "./components/dataList";
  import { resetData } from "@/utils/common";

  const { TextArea, Password } = Input;

  export default {
    name: "DataBase",
    components: {
      AButton: Button,
      AInput: Input,
      APagination: Pagination,
      ASelect: Select,
      AModal: Modal,
      ATextArea: TextArea,
      AInputPassword: Password,
      DataList,
    },
    setup() {
      let sourceOptions = ref([]);
      let sourceValue = ref(undefined);
      let baseValue = ref(undefined);
      let dataList = ref([]); // 数据库列表
      let loading = ref(false); // 是否正在查询
      const pagination = reactive({
        size: "small",
        total: 0,
        current: 1,
        pageSize: 15,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["5", "10", "15", "20"],
        showTotal: (total) => {
          return `共${total}条记录`;
        },
        onChange: (page, pageSize) => {
          pagination.current = page;
          pagination.pageSize = pageSize;
          handleSearch("repeat");
        },
        onShowSizeChange: (current, size) => {
          pagination.current = 1;
          pagination.pageSize = size;
          handleSearch("repeat");
        },
      });
      const options = typeOptions;
      let btnType = ref("add"); // 区分是新增还是编辑
      let selectedItem = reactive({});

      // 顶部查询方法
      const handleSearch = async (type) => {
        if (type === "init") {
          pagination.current = 1;
        }
        const json = {
          dbName: baseValue.value,
          dsId: sourceValue.value,
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        };
        loading.value = true;
        const res = await queryDataBaseByPage(json);
        loading.value = false;
        const result = [];
        if (
          res.message === "成功" &&
          res.data &&
          res.data.dateList &&
          res.data.dateList.length
        ) {
          res.data.dateList.map((item) => {
            const targetType = find(
              options.value,
              (v) => v.value === item.dsType
            );
            result.push({
              id: item.id,
              name: item.dbName,
              sourceId: item.dsId,
              sourceName: item.dsName,
              desc: item.notes,
              icon: targetType.icon,
              date: item.updateDate || item.createDate,
            });
          });
        } else if (
          res.message === "成功" &&
          res.data &&
          !res.data.dateList &&
          !res.data.dateList.length
        ) {
          message.info("暂无数据库信息");
        } else {
          message.error("查询数据库信息失败！");
        }
        dataList.value = result;
      };

      // 顶部重置方法
      const handleReset = () => {
        sourceValue.value = undefined;
        baseValue.value = undefined;
      };

      // 添加、详情弹窗数据
      let addParams = reactive({
        addName: undefined,
        dsId: undefined,
        password: "",
        notes: "",
      });
      let dsOptions = ref([]);
      let dbModalShow = ref(false); // 弹窗是否展示
      let modalTitle = ref(""); // 弹窗标题

      // 打开添加数据源弹窗
      const handleAdd = async () => {
        dbModalShow.value = true;
        btnType.value = "add";
        modalTitle.value = "新增数据库";
        // 获取数据源列表
        getDatasourceList();
      };

      // 获取数据源列表
      const getDatasourceList = async () => {
        const res = await getDsList();
        if (res.message === "成功" && res.data && res.data.length) {
          dsOptions.value = res.data.map((item) => ({
            label: item.dsName,
            value: item.id,
          }));
        } else if (res.message === "成功" && (!res.data || !res.data.length)) {
          dsOptions.value = [];
          message.info("暂无数据源列表，请先配置！");
        } else {
          dsOptions.value = [];
          message.error(res.message);
        }
      };

      // 点击编辑按钮打开弹窗
      const handleEdit = (target) => {
        modalTitle.value = "编辑数据源";
        selectedItem = target;
        btnType.value = "edit";
        addParams.addName = target.name;
        addParams.dsId = target.sourceId;
        addParams.notes = target.desc;
        addParams.password = "";
        // addParams = reactive({
        //   addName: target.name,
        //   dsId: undefined,
        //   password: "",
        //   notes: target.desc,
        // });
        dbModalShow.value = true;
        // 获取数据源列表
        getDatasourceList();
      }

      // 弹窗确认提交方法
      const handleAddDs = async () => {
        if (!addParams.dsId) {
          return message.warning("请选择数据源！");
        }
        if (!addParams.addName) {
          return message.warning("数据库名称不能为空！");
        }
        if (!addParams.password) {
          return message.warning("验证密码不能为空！");
        }
        const json = {
          id: btnType.value === "edit" ? selectedItem.id : undefined, // 有值为编辑，空值为新增
          dbName: addParams.addName,
          dsId: addParams.dsId,
          notes: addParams.notes,
          password: addParams.password,
        };
        const tip = btnType.value === "add" ? "添加" : "修改";
        const loading = message.loading(`正在${tip}`, 0);
        const res = await operationDatabase(json);
        loading();
        if (res.message === "成功") {
          message.success(`${tip}成功`);
          handleCancel();
          handleSearch();
        } else {
          message.error(res.message);
        }
      };

      // 弹窗关闭方法
      const handleCancel = () => {
        dbModalShow.value = false;
        resetData(addParams);
      };

      onMounted(() => {
        handleSearch("init");
      });

      return {
        sourceOptions,
        sourceValue,
        baseValue,
        dataList,
        loading,
        ...toRefs(pagination),
        handleSearch,
        handleReset,

        ...toRefs(addParams),
        modalTitle,
        dbModalShow,
        dsOptions,
        btnType,
        handleAdd,
        handleEdit,
        handleAddDs,
        handleCancel,
      };
    },
  };
</script>

<style lang="less">
  .data-base {
    width: 100%;
    height: 100%;
    padding: 16px;
    min-height: 766px;
    background: #fff;

    &-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      justify-content: space-between;

      .header-text {
        color: #3c485c;
        font-weight: 600;
        font-size: 20px;
        line-height: 28px;
      }

      .header-options {
        display: flex;
        align-items: center;

        &-item {
          display: flex;
          align-items: center;

          &:not(:last-child) {
            margin-right: 24px;
          }

          .item-label {
            color: #3c485c;
            margin-right: 8px;
          }

          .item-input {
            width: 200px;
          }

          .item-button {
            &:first-child {
              margin-right: 8px;
            }
          }
        }
      }
    }

    &-pagination {
      display: flex;
      justify-content: flex-end;
    }
  }

  .add-db-modal {
    .content-item {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;

      &:not(:last-child) {
        margin-bottom: 16px;
      }

      &-label {
        width: 120px;
        text-align: right;
        color: #3c485c;
        margin-right: 8px;
        line-height: 32px;
      }

      &-input,
      &-select {
        width: 454px;
      }

      &-input {
        border-radius: 6px;
        border: 1px solid #d6dbe3;
      }

      &-select {
        .ant-select-selector {
          border-radius: 6px;
          border: 1px solid #d6dbe3;
        }
      }
    }
  }
</style>
