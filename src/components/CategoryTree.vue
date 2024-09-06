<template>
  <div class="category-tree">
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange" animated>
      <a-tab-pane :key="1" :closable="true">
        <template #tab>
          <icon-svg iconClass="node-inside" />
          内置组件
        </template>
        <a-spin :spinning="isLoading" tip="正在查询" v-if="isLoading" />
        <LeftTree
          :data="treeData"
          :isNodeShow="isNodeShow"
          @editCategory="editTreeCategory"
          @deleteCategory="deleteTreeCategory"
          v-else
        />
      </a-tab-pane>
      <a-tab-pane :key="2" :closable="true">
        <template #tab>
          <icon-svg iconClass="node-script" />
          脚本组件
        </template>
        <a-spin :spinning="isLoading" tip="正在查询" v-if="isLoading" />
        <LeftTree
          :data="treeData"
          :isNodeShow="isNodeShow"
          @editCategory="editTreeCategory"
          @deleteCategory="deleteTreeCategory"
          v-else
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
  import LeftTree from "@/components/leftTree";
  import { deleteCategory } from "@/shared/api/componentManage";
  import { getNodeTree } from "@/shared/api/flowEdit";
  import { findTreeNodeById } from "@/utils/common";
  import { Spin, Tabs, message } from "ant-design-vue";
  import { reactive, ref, watchEffect } from "vue";

  const { TabPane } = Tabs;

  export default {
    name: "CategoryTree",
    components: {
      ASpin: Spin,
      ATabs: Tabs,
      ATabPane: TabPane,
      LeftTree,
    },
    props: {
      isNodeShow: {
        default: false,
        type: Boolean,
      },
    },
    emits: ["editCategory", "getNodeList"],
    setup(props, { emit }) {
      // tab-activeKey
      const activeKey = ref(1);
      const treeData = reactive({
        arr: [],
      });
      const isLoading = ref(false);

      // 切换tab
      const handleTabChange = async (key) => {
        // message.destroy();
        activeKey.value = key;
        treeData.arr = [];
        getTreeData(key);
        emit("getNodeList");
      };

      // 获取左侧分类树
      const getTreeData = async (type) => {
        isLoading.value = true;
        let result = [];
        try {
          const res = await getNodeTree(type);
          isLoading.value = false;
          if (
            res.message === "成功" &&
            res.data.length &&
            res.data[0].childNodeCategory
          ) {
            if (props.isNodeShow) {
              res.data[0].childNodeCategory.map((item) => {
                result.push({
                  key: item.id,
                  code: item.categoryCode,
                  title: item.categoryName,
                  children: [],
                  isFold: true,
                  isLoading: false,
                  categoryType: item.categoryType,
                  icon: item.icon,
                });
              });
            } else {
              result = [
                {
                  key: res.data[0].id,
                  code: res.data[0].categoryCode,
                  title: res.data[0].categoryName,
                  children: [],
                  isFold: false,
                  isLoading: false,
                  categoryType: res.data[0].categoryType,
                  icon: null,
                  isLeaf: false,
                },
              ];
              res.data[0].childNodeCategory.map((item) => {
                result[0].children.push({
                  key: item.id,
                  code: item.categoryCode,
                  title: item.categoryName,
                  children: [],
                  isFold: true,
                  isLoading: false,
                  categoryType: item.categoryType,
                  icon: item.icon,
                  isLeaf: false,
                });
              });
            }
          } else if (
            res.message === "成功" &&
            (!res.data.length || !res.data[0].childNodeCategory)
          ) {
            message.info("暂无组件信息！");
          } else {
            message.error(res.message);
          }

          treeData.arr = result;
        } finally {
          isLoading.value = false;
          treeData.arr = result;
        }
      };

      // 编辑分类
      const editTreeCategory = (id) => {
        const data = findTreeNodeById(treeData.arr[0], id);

        const obj = {
          ...data,
          id: data.key,
          categoryName: data.title,
          categoryIcon: data.icon,
          nodeType: data.categoryType,
        };
        emit("editCategory", obj);
      };

      // 删除分类
      const deleteTreeCategory = async (id) => {
        const res = await deleteCategory(id);
        if (res.message === "成功") {
          message.success("删除成功");
          getTreeData(activeKey.value);
        } else {
          message.error(res.message);
        }
      };

      // watchEffect
      watchEffect(async () => {
        getTreeData(); // 默认先展示内置组件的分类
      });

      return {
        activeKey,
        treeData,
        isLoading,
        getTreeData,
        handleTabChange,
        deleteTreeCategory,
        editTreeCategory,
      };
    },
  };
</script>
<style lang="less">
  .category-tree {
    width: 100%;
    height: 100%;

    .ant-tabs {
      height: 100%;

      .ant-tabs-content-holder {
        height: calc(100% - 66px);

        .ant-tabs-content {
          height: 100%;

          .ant-tabs-tabpane {
            position: relative;

            .ant-spin {
              top: 50%;
              left: 50%;
              position: absolute;
              transform: translate(-50%, -50%);
            }
          }
        }
      }
    }

    .ant-tabs-nav-wrap {
      justify-content: center;

      .ant-tabs-nav-list {
        .ant-tabs-tab {
          padding: 14px 0;

          &-btn {
            color: #3c485c;

            .svg-icon {
              width: 18px;
              height: 18px;
            }
          }

          &.ant-tabs-tab-active {
            .ant-tabs-tab-btn {
              color: #1776ff;
            }
          }
        }
      }
    }
  }
</style>
