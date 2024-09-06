<template>
  <div class="component-manage">
    <div class="component-manage-tree">
      <div class="tree-list-title">
        <span class="tree-list-title-text">组件分类</span>
        <a-button type="primary" @click="showAddCategoryModal">新增</a-button>
      </div>
      <CategoryTree
        :isNodeShow="false"
        ref="categoryTree"
        @getNodeList="getNodeList"
        @editCategory="editLeftCategory"
      />
    </div>
    <TableList
      listClass="component-manage-table"
      title="组件列表"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      :loading="searchLoading"
      @change="onTableChange"
    >
      <template #searchOptions>
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">组件名称：</span>
          <a-input
            type="text"
            class="table-list-top-item-input"
            v-model:value.trim="interfaceName"
            placeholder="请输入"
            allow-clear
          />
        </div>
        <!-- <div class="table-list-top-item">
          <span class="table-list-top-item-label">组件类型：</span>
          <a-select
            v-model:value="interfaceType"
            placeholder="请选择"
            class="table-list-top-item-select"
            :options="typeOptions"
          />
        </div> -->
        <div class="table-list-top-item">
          <span class="table-list-top-item-label">组件编号：</span>
          <a-input
            type="text"
            class="table-list-top-item-input"
            v-model:value.trim="interfaceCode"
            placeholder="请输入"
            allow-clear
          />
        </div>
        <div class="table-list-top-item btns">
          <div class="btns-left">
            <a-button type="primary" @click="onSearch">查询</a-button>
            <a-button @click="onReset">重置</a-button>
          </div>
          <div class="btns-right">
            <a-button type="primary" @click="showAddModal">新增</a-button>
          </div>
        </div>
      </template>

      <template #action="{ record }">
        <a-tooltip placement="top" title="编辑">
          <icon-svg
            className="action-img"
            icon-class="action-check"
            @click="checkDetails(record)"
          />
        </a-tooltip>
        <!-- <a-divider type="vertical" />
        <a-tooltip placement="top" title="删除">
          <icon-svg
            className="action-img delete"
            icon-class="action-delete"
            @click="handleDelete(record)"
          />
        </a-tooltip> -->
      </template>
    </TableList>
  </div>

  <a-modal
    v-model:visible="isAddModalShow"
    :title="modalTitle"
    @ok="handleAdd"
    @cancel="handleCancel"
    centered
    width="1000px"
    class="component-add-modal"
  >
    <div class="component-add-modal-content">
      <div class="content-top">
        <div class="content-top-item">
          <span class="content-top-item-label">
            <i class="required">*</i>
            组件名称：
          </span>
          <a-input
            type="text"
            class="content-top-item-input"
            v-model:value.trim="addName"
            placeholder="请输入"
            allow-clear
          />
        </div>
        <div class="content-top-item">
          <span class="content-top-item-label">
            <i class="required">*</i>
            组件类型：
          </span>
          <a-select
            v-model:value="addTypeValue"
            placeholder="请选择"
            class="content-top-item-input"
            :options="addTypeOptions"
          />
        </div>
        <div class="content-top-item">
          <span class="content-top-item-label">
            <i class="required">*</i>
            组件编码：
          </span>
          <a-input
            type="text"
            class="content-top-item-input"
            v-model:value.trim="addCode"
            placeholder="请输入"
            allow-clear
          />
        </div>
        <div class="content-top-item">
          <span class="content-top-item-label">
            <i class="required">*</i>
            组件分类：
          </span>
          <a-select
            v-model:value="addCategory"
            placeholder="请选择"
            class="content-top-item-input"
            :options="nodeCategoryOptions"
          />
        </div>
        <div class="content-top-item long">
          <span class="content-top-item-label">备注：</span>
          <a-textArea
            class="content-top-item-input"
            v-model:value="notes"
            placeholder="请输入"
            allow-clear
            :auto-size="{ minRows: 4, maxRows: 4 }"
          />
        </div>
        <div
          class="content-top-item"
          v-show="
            modalTitle === '新增脚本组件' || modalTitle === '编辑脚本组件'
          "
        >
          <span class="content-top-item-label">
            <i class="required">*</i>
            脚本类型：
          </span>
          <a-select
            v-model:value="scriptTypeValue"
            placeholder="请选择"
            class="content-top-item-input"
            :options="scriptTypeOptions"
          />
        </div>
        <div
          class="content-top-item"
          v-show="
            modalTitle === '新增脚本组件' || modalTitle === '编辑脚本组件'
          "
        >
          <div class="content-top-item-child download" @click="handleDownload">
            <download-outlined />
            下载示例
          </div>
          <div class="content-top-item-child upload">
            <a-upload
              name="file"
              :beforeUpload="beforeUpload"
              accept=".txt"
              :show-upload-list="false"
            >
              <a-button type="primary">
                <cloud-upload-outlined />
                上传脚本
              </a-button>
            </a-upload>
          </div>
        </div>
        <div
          class="content-top-item long"
          v-show="
            modalTitle === '新增脚本组件' || modalTitle === '编辑脚本组件'
          "
        >
          <span class="content-top-item-label">
            <i class="required">*</i>
            脚本内容：
          </span>
          <a-textArea
            class="content-top-item-input"
            v-model:value="script"
            placeholder="请输入"
            allow-clear
            :auto-size="{ minRows: 6, maxRows: 12 }"
          />
        </div>
      </div>
      <div
        class="content-bottom"
        v-if="modalTitle === '新增内置组件' || modalTitle === '编辑内置组件'"
      >
        <a-table
          class="content-bottom-table"
          :dataSource="addData"
          :columns="addColumns"
          bordered
          :pagination="false"
          :rowKey="(record) => record.index"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.key === 'enName'">
              <a-input
                type="text"
                class="content-bottom-table-item-input"
                v-model:value.trim="addData[index][column.key]"
                placeholder="请输入"
                allow-clear
              />
            </template>
            <template v-if="column.key === 'chName'">
              <a-input
                type="text"
                class="content-bottom-table-item-input"
                v-model:value.trim="addData[index][column.key]"
                placeholder="请输入"
                allow-clear
              />
            </template>
            <template v-if="column.key === 'type'">
              <a-select
                v-model:value="addData[index][column.key]"
                placeholder="请选择"
                class="content-bottom-table-item-input"
                :options="paramsTypeOptions"
              />
            </template>
            <template v-if="column.key === 'format'">
              <a-select
                v-model:value="addData[index][column.key]"
                placeholder="请选择"
                class="content-bottom-table-item-input"
                :options="paramsFormatOptions"
              />
            </template>
            <template v-if="column.key === 'required'">
              <a-select
                v-model:value="addData[index][column.key]"
                placeholder="请选择"
                class="content-bottom-table-item-input"
              >
                <a-select-option value="1">是</a-select-option>
                <a-select-option value="0">否</a-select-option>
              </a-select>
            </template>
            <template v-if="column.key === 'action'">
              <a-tooltip
                placement="top"
                title="配置枚举值"
                v-if="record.format === 3"
              >
                <icon-svg
                  className="action-img"
                  icon-class="action-config"
                  @click="addEnumModalShow(record)"
                />
              </a-tooltip>
              <a-divider type="vertical" v-if="record.format === 3" />
              <a-tooltip placement="top" title="删除">
                <icon-svg
                  className="action-img delete"
                  icon-class="action-delete"
                  @click="addDelete(index)"
                />
              </a-tooltip>
            </template>
          </template>
        </a-table>
        <div class="content-bottom-addbtn" @click="handleAddParams">
          <plus-square-outlined class="add-icon" />
          添加字段
        </div>
      </div>
    </div>
  </a-modal>

  <a-modal
    v-model:visible="isAddEnumModalShow"
    title="枚举值配置"
    @ok="handleSaveEnum"
    centered
    width="792px"
    class="enum-add-modal"
  >
    <div class="enum-add-modal-content">
      <a-table
        class="content-table"
        :dataSource="enumList"
        :columns="enumColumns"
        bordered
        :pagination="false"
        :rowKey="(record) => record.index"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'enum'">
            <a-input
              type="text"
              class="content-table-item-input"
              v-model:value.trim="enumList[index][column.key]"
              placeholder="请输入"
              allow-clear
            />
          </template>
          <template v-if="column.key === 'label'">
            <a-input
              type="text"
              class="content-table-item-input"
              v-model:value.trim="enumList[index][column.key]"
              placeholder="请输入"
              allow-clear
            />
          </template>
          <template v-if="column.key === 'action'">
            <a-tooltip placement="top" title="删除">
              <icon-svg
                className="action-img delete"
                icon-class="action-delete"
                @click="enumDelete"
              />
            </a-tooltip>
          </template>
        </template>
      </a-table>
      <div class="content-bottom-addbtn" @click="handleAddEnum">
        <plus-square-outlined class="add-icon" />
        添加枚举值
      </div>
    </div>
  </a-modal>

  <a-modal
    v-model:visible="isAddCategoryModalShow"
    :title="categoryModalTitle"
    @ok="addLeftCategory"
    @cancel="handleCancelCategoryModal"
    centered
    width="572px"
    class="add-category-modal"
  >
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
      class="add-modal-form"
    >
      <a-form-item
        label="分类名称"
        name="categoryName"
        class="add-modal-form-item"
      >
        <a-input
          v-model:value.trim="formState.categoryName"
          placeholder="请输入"
        />
      </a-form-item>
      <a-form-item label="组件类型" name="nodeType" class="add-modal-form-item">
        <a-select
          class="select-icon"
          v-model:value="formState.nodeType"
          placeholder="请选择"
        >
          <a-select-option :value="1">内置组件</a-select-option>
          <a-select-option :value="2">脚本组件</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="图标" name="categoryIcon" class="add-modal-form-item">
        <a-select
          class="select-icon"
          v-model:value="formState.categoryIcon"
          :options="options"
          dropdownClassName="dropdown-class"
          placeholder="请选择"
          :virtual="false"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
  import CategoryTree from "@/components/CategoryTree";
  import IconSvg from "@/components/IconSvg";
  import TableList from "@/components/TableList";
  import {
    addCategory,
    addNodeConfig,
    addScriptNodeConfig,
    nodeConfigDetail,
    nodeListQuery,
    queryCategory,
    queryDictionaryByType,
    scriptDownLoad,
  } from "@/shared/api/componentManage";
  import { downloadFile, resetData } from "@/utils/common";
  import {
    Button,
    Divider,
    Form,
    Input,
    Modal,
    Select,
    Table,
    Tabs,
    Tooltip,
    Upload,
    message,
  } from "ant-design-vue";
  import { cloneDeep, find } from "lodash";
  import { computed, h, onMounted, provide, reactive, ref, toRefs } from "vue";

  const { Option } = Select;
  const { TextArea } = Input;
  const { TabPane } = Tabs;
  const { Item } = Form;

  export default {
    name: "ComponentManage",
    components: {
      ATable: Table,
      AInput: Input,
      AButton: Button,
      ADivider: Divider,
      AForm: Form,
      AFormItem: Item,
      ATooltip: Tooltip,
      ASelect: Select,
      ASelectOption: Option,
      AModal: Modal,
      ATabs: Tabs,
      ATabPane: TabPane,
      ATextArea: TextArea,
      AUpload: Upload,
      TableList,
      CategoryTree,
    },
    setup() {
      let searchLoading = ref(false);
      const searchParams = reactive({
        interfaceName: undefined,
        interfaceType: undefined,
        interfaceCode: undefined,
        typeOptions: [],
        sorter: undefined,
      });
      const columns = [
        {
          title: "序号",
          key: "index",
          dataIndex: "index",
          width: 80,
        },
        {
          title: "组件名称",
          dataIndex: "interfaceName",
          key: "interfaceName",
          width: 150,
        },
        // {
        //   title: "组件类型",
        //   dataIndex: "interfaceType",
        //   key: "interfaceType",
        //   width: 120,
        //   sorter: true,
        // },
        {
          title: "组件编号",
          dataIndex: "interfaceKey",
          key: "interfaceKey",
          width: 180,
        },
        {
          title: "导入时间",
          dataIndex: "createDate",
          key: "createDate",
          width: 120,
          sorter: true,
        },
        {
          title: "操作",
          key: "action",
          dataIndex: "action",
          width: 80,
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
          getNodeList();
        },
        onShowSizeChange: (current, size) => {
          pagination.current = 1;
          pagination.pageSize = size;
          getNodeList();
        },
      });
      const activeKey = computed(() => {
        return categoryTree.value.activeKey;
      });

      // 查询组件列表方法
      const getNodeList = async () => {
        searchLoading.value = true;
        const json = {
          nodeCode: searchParams.interfaceCode || null,
          nodeName: searchParams.interfaceName || null,
          nodeCategory: searchParams.interfaceType || null,
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          nodeType: activeKey.value,
          sort: searchParams.sorter,
        };
        const data = [];
        try {
          const res = await nodeListQuery(json);
          searchLoading.value = false;
          if (res.message === "成功" && res.data.dateList) {
            if (activeKey.value === 1) {
              // 内置组件
              res.data.dateList.map((item, index) => {
                data.push({
                  ...item,
                  index:
                    (pagination.current - 1) * pagination.pageSize + index + 1,
                  interfaceName: item.nodeName,
                  interfaceKey: item.nodeCode,
                });
              });
            } else {
              res.data.dateList.map((item, index) => {
                data.push({
                  ...item,
                  index:
                    (pagination.current - 1) * pagination.pageSize + index + 1,
                  interfaceName: item.snName,
                  interfaceKey: item.snCode,
                });
              });
            }

            pagination.total = res.data.totalCount;
            dataSource.value = data;
          } else {
            message.error(res.message);
          }
          console.log("dataSource", dataSource.value);
        } finally {
          searchLoading.value = false;
          dataSource.value = data;
        }
      };

      // 表格时间排序改变
      const onTableChange = (pagination, filters, sorter) => {
        searchParams.sorter =
          sorter.order === "ascend"
            ? "asc"
            : sorter.order === "descend"
            ? "desc"
            : undefined;
        onSearch();
      };

      // 查询方法
      const onSearch = (type) => {
        if (type === "init") {
          pagination.current = 1;
        }
        getNodeList();
      };

      const onReset = () => {
        resetData(searchParams);
        onSearch("init");
      };

      // 查看组件详情方法
      const checkDetails = async (record) => {
        console.log("checkDetails", record);
        if (activeKey.value === 1) {
          modalTitle.value = "编辑内置组件";
          getNodeConfig(record);
        } else {
          modalTitle.value = "编辑脚本组件";
          const {
            interfaceName,
            nodeCategory,
            interfaceKey,
            scriptType,
            scriptLanguage,
            scriptContext,
            notes,
          } = record;
          const obj = {};
          obj.nodeId = record.id;
          obj.addName = interfaceName;
          obj.addCode = interfaceKey;
          obj.addCategory = String(nodeCategory);
          obj.addTypeValue = scriptType;
          obj.scriptTypeValue = scriptLanguage;
          obj.script = scriptContext;
          obj.notes = notes;
          Object.assign(addParams, obj);
          addTypeOptions.value = scriptOptions;
        }
        isAddModalShow.value = true;
        const target = find(
          treeData.value,
          (v) => v.categoryType === activeKey.value
        );
        nodeCategoryOptions.value = target.children.map((item) => {
          return {
            label: item.categoryName,
            value: item.id,
          };
        });
      };

      // 获取组件详情
      const getNodeConfig = async (record) => {
        const loading = message.loading("正在查询", 0);
        const res = await nodeConfigDetail(record.id);
        loading();
        await getAllCategory(); // 更新分类树

        if (res.message === "成功" && res.data) {
          // 内置组件
          const {
            nodeName,
            nodeParams,
            nodeCategory,
            nodeCode,
            nodeElType,
            notes,
          } = res.data;
          const obj = {};
          obj.nodeId = record.id;
          obj.addName = nodeName;
          obj.addCode = nodeCode;
          obj.addCategory = String(nodeCategory);
          obj.addTypeValue = nodeElType;
          obj.notes = notes;
          obj.addData = nodeParams.map((item, index) => {
            return {
              key: index + 1,
              enName: item.paramEsName,
              chName: item.paramCsName,
              type: item.paramType,
              format: item.inputFormat,
              required: String(item.proRequired),
              enumList: JSON.parse(item.enumValue),
            };
          });
          Object.assign(addParams, obj);
          addTypeOptions.value = usualOptions;
          isAddModalShow.value = true;
          const target = find(
            treeData.value,
            (v) => v.categoryType === activeKey.value
          );
          nodeCategoryOptions.value = target.children.map((item) => {
            return {
              label: item.categoryName,
              value: item.id,
            };
          });
        } else if (!res.data) {
          message.info("暂无详情信息");
        } else {
          message.error(res.message);
        }
      };

      // 删除组件方法
      const handleDelete = (record) => {
        console.log("handleDelete", record);
      };

      /* 弹窗参数、方法 */
      // 弹窗标题
      const modalTitle = ref("");
      // 添加组件的相关参数
      const addParams = reactive({
        addName: undefined,
        addCode: undefined, // 组件编码
        addTypeValue: undefined, //组件类型
        addCategory: undefined, //组件分类
        notes: undefined, //备注
        script: undefined, //脚本
        scriptTypeValue: undefined, //脚本类型
        addData: [],
      });
      // 组件类型选项
      let addTypeOptions = ref([]); // 添加的组件可选的组件类型
      let scriptOptions = [];
      let usualOptions = [];
      // 字段类型选项
      let paramsTypeOptions = ref([]);
      let nodeCategoryOptions = ref([]); // 组件分类选项
      let addDataIndex = ref(1); // 往addData添加字段时的index
      let addEnumIndex = ref(1); // 往enumList添加字段时的index
      const paramsFormatOptions = ref([
        {
          label: "输入框",
          value: 1,
        },
        {
          label: "文本域",
          value: 2,
        },
        {
          label: "下拉框",
          value: 3,
        },
        {
          label: "时间",
          value: 4,
        },
      ]); // 组件参数输入类型
      const scriptTypeOptions = ref([
        {
          label: "Groovy",
          value: "Groovy",
        },
        {
          label: "Javascript",
          value: "Javascript",
        },
        {
          label: "QLExpress",
          value: "QLExpress",
        },
        {
          label: "Python",
          value: "Python",
        },
        {
          label: "Lua",
          value: "Lua",
        },
        {
          label: "Aviator",
          value: "Aviator",
        },
      ]); // 脚本类型选项
      let isAddModalShow = ref(false); // 添加组件弹窗是否展示
      let isAddEnumModalShow = ref(false); // 添加枚举值弹窗是否展示
      let selectParam = ref(undefined); // 打开枚举值弹窗时对应的选中的参数
      const addColumns = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 65,
          align: "center",
        },
        {
          title: "字段名称（英文）",
          dataIndex: "enName",
          key: "enName",
          width: 173,
        },
        {
          title: "字段名称（中文）",
          dataIndex: "chName",
          key: "chName",
          width: 173,
        },
        {
          title: "字段类型",
          dataIndex: "type",
          key: "type",
          width: 160,
        },
        {
          title: "输入类型",
          dataIndex: "format",
          key: "format",
          width: 180,
        },
        {
          title: "是否必填",
          dataIndex: "required",
          key: "required",
          width: 100,
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          width: 100,
        },
      ];
      let enumList = ref([]); // 枚举值弹窗内的枚举值list
      const enumColumns = [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 66,
          align: "center",
        },
        {
          title: "枚举值",
          dataIndex: "enum",
          key: "enum",
          width: 300,
        },
        {
          title: "展示字段",
          dataIndex: "label",
          key: "label",
          width: 300,
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          width: 80,
        },
      ];
      // 点击展示添加组件弹窗
      const showAddModal = async () => {
        await getAllCategory(); // 更新分类树
        const target = find(
          treeData.value,
          (v) => v.categoryType === activeKey.value
        );
        nodeCategoryOptions.value = target.children.map((item) => {
          return {
            label: item.categoryName,
            value: item.id,
          };
        });
        if (activeKey.value === 1) {
          modalTitle.value = "新增内置组件";
          isAddModalShow.value = true;
          addParams.addData = [];
          addTypeOptions.value = usualOptions;
        } else {
          modalTitle.value = "新增脚本组件";
          isAddModalShow.value = true;
          addTypeOptions.value = scriptOptions;
        }
      };

      // 添加一项字段
      const handleAddParams = () => {
        addParams.addData.push({
          index: addDataIndex.value,
          enName: "",
          chName: "",
          type: undefined,
          required: "1",
          enumList: [],
        });
        addDataIndex.value += 1;
      };

      // 新增组件弹窗确认方法
      const handleAdd = async () => {
        if (!addParams.addName) {
          return message.warning("组件名称必填！");
        }
        // if (addParams.addName && addParams.addName.length > 8) {
        //   return message.warning("组件名称不能超过8个字符！");
        // }
        if (!addParams.addTypeValue) {
          return message.warning("请选择组件类型！");
        }
        if (!addParams.addCode) {
          return message.warning("组件编码必填！");
        }
        if (!addParams.addCategory) {
          return message.warning("请选择组件分类！");
        }
        if (activeKey.value === 1) {
          // 内置组件
          handleAddUsualNode();
        } else {
          handleAddScriptNode();
        }
      };

      // 添加内置组件方法
      const handleAddUsualNode = async () => {
        // 校验组件参数
        const { flag, msg } = checkAddData(addParams.addData);
        if (!flag) {
          return message.warning(msg);
        }

        const nodeParams = addParams.addData.map((item) => {
          return {
            paramCsName: item.chName,
            paramEsName: item.enName,
            inputFormat: item.format,
            proRequired: item.required,
            paramType: item.type,
            enumValue: JSON.stringify(item.enumList),
          };
        });
        const json = {
          nodeName: addParams.addName,
          nodeCode: addParams.addCode,
          nodeCategory: addParams.addCategory,
          nodeElType: addParams.addTypeValue,
          notes: addParams.notes,
          nodeParams,
          nodeId: addParams.nodeId || null, // 编辑组件时传id
        };
        const res = await addNodeConfig(json);
        if (res.message === "成功") {
          handleCancel();
          if (modalTitle.value === "新增内置组件") {
            message.success("新增内置组件成功");
          } else {
            message.success("编辑内置组件成功");
          }

          onSearch("init");
        } else {
          message.error(res.message);
        }
      };

      // 添加脚本组件方法
      const handleAddScriptNode = async () => {
        if (!addParams.scriptTypeValue) {
          return message.warning("请选择脚本类型！");
        }
        if (!addParams.script) {
          return message.warning("请输入脚本或者上传脚本！");
        }
        const json = {
          nodeName: addParams.addName,
          nodeCode: addParams.addCode,
          nodeCategory: addParams.addCategory,
          nodeElType: addParams.addTypeValue,
          notes: addParams.notes,
          scriptLanguage: addParams.scriptTypeValue,
          scriptContext: addParams.script,
          nodeId: addParams.nodeId || null, // 编辑组件时传id
        };
        const res = await addScriptNodeConfig(json);
        if (res.message === "成功") {
          handleCancel();
          if (modalTitle.value === "新增脚本组件") {
            message.success("新增脚本组件成功");
          } else {
            message.success("编辑脚本组件成功");
          }

          onSearch("init");
        } else {
          message.error(res.message);
        }
      };

      // 下载示例
      const handleDownload = async () => {
        const res = await scriptDownLoad();
        downloadFile(res, "脚本示例");
      };

      // 上传脚本
      const beforeUpload = (file) => {
        console.log("beforeUpload", file);
        const reader = new FileReader(); // 创建文件对象
        reader.readAsText(file);
        reader.onload = function () {
          // 读取完成--->回调函数,result：存储文件内容,this.result访问
          // 切割文本数据 操作内容
          if (file.type !== "text/plain") {
            addParams.script = undefined;
            message.warning("仅支持txt文件上传！");
          } else {
            addParams.script = this.result;
          }
        };
        return false; // 阻止默认访问当前ip下的某个路径的行为
      };

      // 校验组件参数方法
      const checkAddData = (data) => {
        let msg = "";
        let flag = true;
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          if (
            !element.enName ||
            !element.chName ||
            !element.type ||
            !element.format
          ) {
            msg = "请填写完整的字段参数！";
            flag = false;
            break;
          } else if (element.format === 3) {
            /*
              如果输入类型选中下拉框，则需要配置枚举值，
              校验规则为至少有一个枚举值项，且每项枚举值的label和value都必填
            */
            if (!element.enumList.length) {
              msg = "请至少配置一项枚举值！";
              flag = false;
              break;
            }
          }
        }
        return { msg, flag };
      };

      // 关闭添加组件弹窗
      const handleCancel = () => {
        isAddModalShow.value = false;
        resetData(addParams);
      };

      // 删除配置的字段
      const addDelete = (index) => {
        addParams.addData.splice(index, 1);
      };

      // 打开枚举值弹窗
      const addEnumModalShow = (record) => {
        selectParam = record;
        isAddEnumModalShow.value = true;
        enumList.value = cloneDeep(record.enumList);
      };

      // 添加枚举值配置
      const handleAddEnum = () => {
        addEnumIndex.value += 1;
        enumList.value.push({
          index: addEnumIndex.value,
          enum: "",
          label: "",
        });
      };

      // 保存枚举值配置
      const handleSaveEnum = () => {
        // 校验枚举值是否均已填好
        let flag = true; // 是否校验通过
        if (enumList.value.length) {
          for (let i = 0; i < enumList.value.length; i++) {
            const element = enumList.value[i];
            if (!element.enum) {
              message.warning(`第${i + 1}项的枚举值未填写！`);
              flag = false;
              break;
            }
            if (!element.label) {
              message.warning(`第${i + 1}项的展示字段未填写！`);
              flag = false;
              break;
            }
          }
        } else {
          message.warning("请填写至少一项枚举值！");
          flag = false;
        }
        if (!flag) return;
        selectParam.enumList = enumList.value;
        isAddEnumModalShow.value = false;
      };

      // 删除枚举值
      const enumDelete = (index) => {
        enumList.value.splice(index, 1);
      };

      /* 分类树参数、方法 */
      const selectedKeys = ref(["0-0-0"]);

      const categoryTree = ref(null);
      const isAddCategoryModalShow = ref(false); // 新增组件分类弹窗是否展示
      const categoryModalTitle = ref(""); // 新增组件分类弹窗标题
      // 打开添加分类弹窗
      const showAddCategoryModal = () => {
        isAddCategoryModalShow.value = true;
        categoryModalTitle.value = "新增组件分类";
      };
      // 关闭添加分类弹窗
      const handleCancelCategoryModal = () => {
        isAddCategoryModalShow.value = false;
        categoryModalTitle.value = "";
        resetData(formState);
      };
      // 添加分类弹窗form表单内容
      const formState = reactive({
        id: "",
        categoryName: "",
        nodeType: undefined,
        categoryIcon: undefined,
      });
      // 图标选项
      const options = ref([
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-database",
            iconClass: "icon-database",
          }),
          value: "icon-database",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-cloud",
            iconClass: "icon-cloud",
          }),
          value: "icon-cloud",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-connection",
            iconClass: "icon-connection",
          }),
          value: "icon-connection",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-d",
            iconClass: "icon-d",
          }),
          value: "icon-d",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-data",
            iconClass: "icon-data",
          }),
          value: "icon-data",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-default",
            iconClass: "icon-default",
          }),
          value: "icon-default",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-download",
            iconClass: "icon-download",
          }),
          value: "icon-download",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-execute",
            iconClass: "icon-execute",
          }),
          value: "icon-execute",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-global",
            iconClass: "icon-global",
          }),
          value: "icon-global",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-img",
            iconClass: "icon-img",
          }),
          value: "icon-img",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-inspect",
            iconClass: "icon-inspect",
          }),
          value: "icon-inspect",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-interface",
            iconClass: "icon-interface",
          }),
          value: "icon-interface",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-internet",
            iconClass: "icon-internet",
          }),
          value: "icon-internet",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-judge",
            iconClass: "icon-judge",
          }),
          value: "icon-judge",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-linegraph",
            iconClass: "icon-linegraph",
          }),
          value: "icon-linegraph",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-maze",
            iconClass: "icon-maze",
          }),
          value: "icon-maze",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-message",
            iconClass: "icon-message",
          }),
          value: "icon-message",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-radar",
            iconClass: "icon-radar",
          }),
          value: "icon-radar",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-revert",
            iconClass: "icon-revert",
          }),
          value: "icon-revert",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-script",
            iconClass: "icon-script",
          }),
          value: "icon-script",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-search",
            iconClass: "icon-search",
          }),
          value: "icon-search",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-service",
            iconClass: "icon-service",
          }),
          value: "icon-service",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-smile",
            iconClass: "icon-smile",
          }),
          value: "icon-smile",
        },
        {
          label: h(IconSvg, {
            className: "action-img",
            value: "icon-wave",
            iconClass: "icon-wave",
          }),
          value: "icon-wave",
        },
      ]);

      // 添加/编辑分类保存
      const addLeftCategory = async () => {
        if (!formState.categoryName) {
          return message.warning("分类名称不可为空！");
        }
        if (!formState.nodeType) {
          return message.warning("请选择组件类型！");
        }
        if (!formState.categoryIcon) {
          return message.warning("请选择组件图标！");
        }
        const json = {
          id: formState.id,
          categoryName: formState.categoryName,
          icon: formState.categoryIcon,
          categoryType: formState.nodeType, //分类类型:1、内置组件分类；2、脚本组件分类
        };
        const target = find(
          treeData.value,
          (v) => v.categoryType === formState.nodeType
        );
        json.parentId = target.id;
        const res = await addCategory(json);

        if (res.message === "成功") {
          message.success("操作成功");
          isAddCategoryModalShow.value = false;
          categoryTree.value.handleTabChange(formState.nodeType);
        } else {
          message.error(res.message);
        }
      };

      // 编辑分类
      const editLeftCategory = async (data) => {
        if (data) {
          Object.assign(formState, data);
          categoryModalTitle.value = "编辑组件分类";
          isAddCategoryModalShow.value = true;
        } else {
          message.info("暂无详情信息");
        }
      };

      // 选中分类
      const leftTreeSelected = async (selectedKey) => {
        if (selectedKey) {
          searchParams.interfaceType = selectedKey;
        } else {
          searchParams.interfaceType = undefined;
        }
        getNodeList();
      };
      // 注册treeSelected给后代组件leftTree使用
      provide("treeSelected", (value) => {
        leftTreeSelected(value);
      });
      // 获取选项值
      const getDictionaryByType = async (type) => {
        const res = await queryDictionaryByType(type);
        if (res.message === "成功") {
          if (type === "node_type") {
            usualOptions = res.data.map((item) => {
              return {
                label: item.dicName,
                value: item.dicValue,
              };
            });
          } else if (type === "file_type") {
            paramsTypeOptions.value = res.data.map((item) => {
              return {
                label: item.dicName,
                value: item.id,
              };
            });
          } else {
            scriptOptions = res.data.map((item) => {
              return {
                label: item.dicName,
                value: item.dicValue,
              };
            });
          }
        } else {
          message(res.message);
        }
      };

      const treeData = ref([]);
      // 获取所有分类信息
      const getAllCategory = async () => {
        const res = await queryCategory();
        treeData.value = res.data.map((item) => ({
          categoryType: item.categoryType,
          id: item.id,
          categoryName: item.categoryName,
          children: item.children.map((cell) => ({
            categoryType: cell.categoryType,
            id: cell.id,
            categoryName: cell.categoryName,
          })),
        }));
      };

      onMounted(async () => {
        // 获取列表
        getNodeList();
        getAllCategory();
        // 获取字段类型
        getDictionaryByType("file_type");
        // 获取组件类型
        await getDictionaryByType("node_type");
        getDictionaryByType("script_type");
        addTypeOptions.value = usualOptions;
      });

      return {
        columns,
        ...toRefs(searchParams),
        dataSource,
        searchLoading,
        pagination,
        onSearch,
        onReset,
        checkDetails,
        handleDelete,

        modalTitle,
        ...toRefs(addParams),
        addColumns,
        paramsFormatOptions,
        isAddModalShow,
        isAddEnumModalShow,
        addTypeOptions,
        nodeCategoryOptions,
        paramsTypeOptions,
        enumColumns,
        enumList,
        scriptTypeOptions,
        showAddModal,
        handleAdd,
        addDelete,
        addEnumModalShow,
        handleAddEnum,
        handleAddParams,
        handleSaveEnum,
        enumDelete,
        handleCancel,
        handleDownload,
        beforeUpload,

        selectedKeys,
        categoryTree,
        isAddCategoryModalShow,
        categoryModalTitle,
        formState,
        options,
        addLeftCategory,
        editLeftCategory,
        leftTreeSelected,
        showAddCategoryModal,
        handleCancelCategoryModal,
        onTableChange,
        getNodeList,
      };
    },
  };
</script>

<style lang="less">
  .component-manage {
    width: 100%;
    height: 100%;
    display: flex;
    background: #ffffff;
    box-shadow: 0px 2px 8px rgba(31, 48, 78, 0.05),
      0px 10px 16px 4px rgba(31, 48, 78, 0.04);
    border-radius: 6px;

    &-tree {
      width: 320px;
      padding: 16px;
      .tree-list-title {
        margin-bottom: 16px;
        height: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &-text {
          font-weight: 600;
          font-size: 20px;
          line-height: 32px;
        }
      }
      .category-tree {
        height: calc(100% - 48px);
        padding: 0 16px 16px;
        border: 1px solid #d6dbe3;
      }

      .action-img {
        width: 16px;
        height: 16px;
        color: #1776ff;
      }
    }

    &-table {
      width: calc(100% - 320px);
      box-shadow: none;
      border-radius: 0;
    }
  }
  .component-add-modal {
    &-content {
      .content-top {
        display: grid;
        grid-column-gap: 48px;
        grid-template-columns: 1fr 1fr;
        margin-bottom: 16px;
        align-items: center;
        flex-wrap: wrap;

        &-item {
          width: 100%;
          display: flex;
          align-items: center;
          margin-bottom: 16px;

          &.long {
            grid-column-start: 1;
            grid-column-end: 3;
            align-items: flex-start;
          }

          &-label {
            width: 82px;
            color: #3c485c;
            margin-right: 8px;
            text-align: right;
            white-space: nowrap;
          }

          &-input {
            flex: 1;
          }

          &:last-child {
            margin-bottom: 0;
          }

          &-child {
            margin-right: 24px;

            &.download {
              color: #1776ff;
              cursor: pointer;
            }

            &.upload {
              .ant-btn {
                padding: 0 12px;
              }
            }
          }
        }
      }

      .content-bottom {
        &-table {
          &-item {
            &-input {
              width: 100%;
            }
          }
        }
      }
    }
  }

  .dropdown-class {
    padding: 4px 8px;

    .rc-virtual-list-holder-inner {
      flex-direction: row !important;
      flex-wrap: wrap;

      .ant-select-item {
        width: 24px;
        height: 24px;
        padding: 2px;
        min-height: auto;

        &:not(:nth-child(12n)) {
          margin-right: 12px;
        }

        .ant-select-item-option-content {
          display: flex;
          align-items: center;
          justify-content: center;

          .action-img {
            width: 20px;
            height: 20px;
            color: #97a3b7;

            &.active {
              color: #1776ff;
            }
          }
        }
      }
    }

    // 选择器下拉菜单选中的数据，与鼠标移入样式
    .ant-select-item-option-selected {
      .action-img {
        width: 16px;
        height: 16px;
        color: #1776ff !important;
      }
    }
  }

  .add-category-modal {
    .select-icon {
      .ant-select-selection-item {
        .action-img {
          width: 20px;
          height: 20px;
          color: #1776ff;
        }
      }
    }
  }

  .content-bottom-addbtn {
    width: 100%;
    height: 32px;
    display: flex;
    cursor: pointer;
    margin-top: 16px;
    color: #1776ff;
    user-select: none;
    border-radius: 6px;
    align-items: center;
    background: #e6f4ff;
    justify-content: center;
    border: 1px dashed #1776ff;

    .add-icon {
      font-size: 16px;
      margin-right: 8px;
    }
  }
</style>
