<template>
  <div class="tree-list">
    <div class="tree-list-title">
      <span class="tree-list-title-text">节点分类</span>
      <a-button type="primary" @click="showAddModal">新增</a-button>
    </div>
    <div class="tree-list-content">
      <div class="tree-list-spin" v-if="treeLoading">
        <a-spin />
      </div>
      <a-tree
        v-model:selectedKeys="selectedKeys"
        :tree-data="treeData"
        default-expand-all
        class="tree-list-tree"
        @select="handleTreeSelect"
        v-else-if="treeData[0].children.length"
      >
        <template #title="{ key, selected, title }">
          <span
            :class="['tree-list-item', title === '全部' ? 'root' : 'child']"
          >
            <span class="tree-list-item-left">
              <span class="tree-list-item-icon">
                <icon-svg
                  :className="
                    selectedKeys[0] === title
                      ? 'action-img active'
                      : 'action-img'
                  "
                  v-if="title !== '全部'"
                  :icon-class="findTreeNode(treeData[0], key).icon"
                  @click="checkDetails(record)"
                />
              </span>
              {{ title }}
            </span>
            <span class="tree-list-item-right">
              <icon-svg
                v-if="title !== '全部'"
                className="action-img edit"
                icon-class="action-edit"
                @click="handleEdit(key)"
              />
              <a-popconfirm
                title="确认删除该结点吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(key)"
              >
                <icon-svg
                  v-if="title !== '全部'"
                  className="action-img delete"
                  icon-class="action-delete"
                />
              </a-popconfirm>
            </span>
          </span>
        </template>
      </a-tree>
    </div>
  </div>

  <a-modal
    v-model:visible="isAddModalShow"
    :title="modalTitle"
    @ok="handleAdd"
    @cancel="handleCancleModal"
    centered
    width="572px"
    class="component-add-modal"
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
        <a-input v-model:value="formState.categoryName" placeholder="请输入" />
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
  import {
    Tree,
    Button,
    Popconfirm,
    Modal,
    Form,
    Input,
    Select,
    Spin,
    message,
  } from "ant-design-vue";
  import { reactive, ref, watchEffect, h } from "vue";
  import { resetData, findTreeNodeById } from "@/utils/common";
  import IconSvg from "@/components/IconSvg";

  const { Item } = Form;

  export default {
    name: "LeftTreeList",
    props: {
      data: {
        type: Object,
        default: {},
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
        required: false,
      },
    },
    emits: ["deleteCategory", "addCategory", "treeSelected"],
    components: {
      AButton: Button,
      ATree: Tree,
      APopconfirm: Popconfirm,
      AModal: Modal,
      AForm: Form,
      AFormItem: Item,
      AInput: Input,
      ASelect: Select,
      AFormItem: Item,
      ASpin: Spin,
    },
    setup(props, { emit }) {
      const selectedKeys = ref([]);
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
      const treeData = ref([
        {
          title: "全部",
          key: "0-0",
          children: [],
        },
      ]);
      let treeLoading = ref(false);
      
      // 选中某个分类，查询当前分类下的节点
      const handleTreeSelect = (selectedKeys) => {
        emit("treeSelected", selectedKeys);
      };

      // 删除分类
      const handleDelete = (id) => {
        emit("deleteCategory", id);
      };
      const findTreeNode = (node, id) => {
        return findTreeNodeById(node, id);
      };
      // 编辑分类
      const handleEdit = (id) => {
        modalTitle.value = "编辑节点分类";

        const data = findTreeNodeById(treeData.value[0], id);

        const obj = {
          ...data,
          categoryName: data.title,
          categoryIcon: data.icon,
        };
        Object.assign(formState, obj);
        if (data) {
          isAddModalShow.value = true;
        } else {
          message.info("暂无详情信息");
        }
      };

      // 新增节点弹窗
      let isAddModalShow = ref(false);
      let modalTitle = ref("新增节点分类");

      const formState = reactive({
        categoryName: "",
        categoryIcon: undefined,
      });
      // 打开新增节点弹窗
      const showAddModal = () => {
        modalTitle.value = "新增节点分类";
        isAddModalShow.value = true;
      };
      // 取消新增节点弹窗
      const handleCancleModal = () => {
        isAddModalShow.value = false;
        resetData(formState);
      };
      // 添加新的分类
      const handleAdd = () => {
        if (!formState.categoryName) {
          message.error("请添加数据源名称！");
          returnStatement;
        } else if (!formState.categoryIcon) {
          message.error("请选择图标！");
          return;
        }
        emit("addCategory", formState);
        handleCancleModal();
      };

      watchEffect(() => {
        treeData.value = props.data;
        treeLoading.value = props.loading;
      });

      return {
        options,
        selectedKeys,
        treeData,
        treeLoading,
        isAddModalShow,
        formState,
        modalTitle,
        handleDelete,
        showAddModal,
        handleCancleModal,
        handleAdd,
        handleEdit,
        findTreeNode,
        handleTreeSelect,
      };
    },
  };
</script>

<style lang="less">
  .tree-list {
    width: 100%;
    height: 100%;

    &-title {
      margin: 16px;
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

    &-content {
      height: calc(100% - 80px);
      margin: 16px;
      border: 1px solid #d6dbe3;
      padding: 6px;

      .tree-list-spin {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tree-list-tree {
        .ant-tree-list {
          &-holder {
            .ant-tree-treenode {
              width: 100%;

              .ant-tree-node-content-wrapper {
                width: 100%;

                &:hover {
                  background-color: #fff;
                }

                &.ant-tree-node-selected {
                  background-color: #fff;

                  .tree-list-item {
                    color: #1776ff;
                    background-color: #e6f4ff;

                    .action-img {
                      color: #1776ff !important;
                    }
                  }
                }

                .tree-list-item {
                  &.child {
                    margin-left: 2px;
                    padding-left: 12px;

                    &:hover {
                      background-color: #e6f4ff;
                    }

                    .action-img {
                      width: 16px;
                      height: 16px;
                      color: #97a3b7;
                      margin-bottom: 2px;

                      &.active {
                        color: #1776ff;
                      }

                      &.edit {
                        color: #1776ff;
                      }
                      &.disabled {
                        color: #d6dbe3;
                        cursor: not-allowed;
                      }

                      &.delete {
                        margin-left: 8px;
                      }
                    }
                  }
                }
              }

              .ant-tree-indent,
              .ant-tree-switcher-noop {
                display: none;
              }
            }
          }
        }
      }
    }

    &-item {
      display: flex;
      justify-content: space-between;

      &-right {
        display: none;
      }

      &:hover {
        .tree-list-item-right {
          display: block !important;
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

  .select-icon {
    .ant-select-selection-item {
      .action-img {
        width: 20px;
        height: 20px;
        color: #1776ff;
      }
    }
  }
</style>
