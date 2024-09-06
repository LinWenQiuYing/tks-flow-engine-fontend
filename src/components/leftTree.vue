<template>
  <div class="left-tree">
    <div
      class="left-tree-item"
      v-for="(item, index) in treeData.arr"
      :key="index"
    >
      <div
        class="left-tree-item-title"
        @click="handleClickTreeItem(item)"
        :style="{ display: item.title === '全部' ? 'block' : 'flex' }"
      >
        <div class="left-tree-item-title-left">
          <loading-outlined v-if="item.isLoading" class="status-icon" />
          <caret-right-outlined
            v-else
            v-show="isNodeShow || (!isNodeShow && item.title === '全部')"
            class="status-icon"
            :rotate="item.isFold ? 0 : 45"
            :style="{ color: item.isFold ? '#5F7292' : '#1776FF' }"
          />
          <icon-svg
            :icon-class="item.icon"
            class="item-icon"
            v-show="item.title !== '全部'"
          />
          <!-- <img :src="require(`@/assets/images/img/${item.icon}.svg`)" alt="" /> -->
          <span
            class="title-text"
            :style="{ color: item.isFold ? '#3C485C' : '#1776FF' }"
          >
            {{ item.title }}
          </span>
        </div>
      </div>
      <div
        class="left-tree-item-children"
        :style="{
          height: item.isFold ? 0 : 36 * item.children.length + 'px',
          opacity: item.isFold ? 0 : 1,
          paddingLeft: isNodeShow ? '35px' : '0',
        }"
      >
        <div
          :class="[
            child.isLeaf ? 'children-item' : 'left-tree-item',
            selectedKey === child.key ? 'active' : '',
          ]"
          v-for="child in item.children"
          :key="child.title"
          :style="{
            height: item.isFold ? 0 : '28px',
            opacity: item.isFold ? 0 : 1,
            display: item.isFold ? 'none' : 'flex',
          }"
          draggable="true"
          @dragstart.native="(e) => handleDragStart(e, child)"
        >
          <span
            v-if="child.isLeaf"
            class="children-item-title"
            :style="{
              height: item.isFold ? 0 : '20px',
              opacity: item.isFold ? 0 : 1,
              display: item.isFold ? 'none' : 'inline',
            }"
          >
            {{ child.title }}
          </span>
          <div
            class="left-tree-item-title"
            @click="handleClickTreeItem(child)"
            v-else
          >
            <div class="left-tree-item-title-left">
              <icon-svg
                :icon-class="child.icon"
                class="item-icon"
                v-show="child.title !== '全部'"
                :style="{
                  color: selectedKey === child.key ? '#1776FF' : '#97A3B7',
                }"
              />
              <!-- <img :src="require(`@/assets/images/img/${child.icon}.svg`)" alt="" /> -->
              <span
                class="title-text"
                :title="child.title"
                :style="{
                  color: selectedKey === child.key ? '#1776FF' : '#3C485C',
                }"
              >
                {{ child.title }}
              </span>
            </div>
            <span class="left-tree-item-title-right">
              <icon-svg
                className="action-img edit"
                icon-class="action-edit"
                @click="(e) => handleEdit(e, child.key)"
              />
              <a-popconfirm
                title="确认删除该分类吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="(e) => handleDelete(e, child.key)"
              >
                <icon-svg
                  className="action-img delete"
                  icon-class="action-delete"
                  @click="(e) => e.stopPropagation()"
                />
              </a-popconfirm>
            </span>
          </div>
          <img
            v-if="child.isLeaf"
            src="@/assets/images/img/flex.svg"
            alt=""
            :style="{
              opacity: item.isFold ? 0 : 1,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { queryNodeList } from "@/shared/api/flowEdit";
  import { Popconfirm, message } from "ant-design-vue";
  import { inject, reactive, ref, watchEffect } from "vue";

  export default {
    name: "LeftTree",
    props: {
      data: {
        type: Object,
        default: {
          arr: [],
        },
        required: true,
      },
      isNodeShow: {
        default: false,
        type: Boolean,
      },
    },
    emits: ["deleteCategory", "editCategory"],
    components: {
      APopconfirm: Popconfirm,
    },
    setup(props, { emit }) {
      // treeData
      let treeData = reactive({
        arr: [],
      });

      // inject(Key, defauleValue);
      const treeSelected = inject("treeSelected", null); // 选中组件的方法，从祖先组件获取
      const selectedKey = ref(undefined); // 选中的key

      // 点击title折叠菜单树图
      const handleClickTreeItem = (item) => {
        if (props.isNodeShow) {
          if (item.hasChildren) {
            // 第一次获取children信息后会给hasChildren赋值为true，后续以hasChildren的值为判断是否调用接口的依据
            item.isFold = !item.isFold;
          } else {
            item.isLoading = true;
            queryListData(item);
          }
        } else {
          if (item.title === "全部") {
            item.isFold = !item.isFold;
            selectedKey.value = null;
          } else {
            selectedKey.value = item.key;
          }
          treeSelected(selectedKey.value);
        }
      };

      // dragstart function
      const handleDragStart = (e, target) => {
        e.dataTransfer.setData("data", JSON.stringify(target)); // 只能传输string
      };

      // 查询左侧菜单列表
      const queryListData = async (target) => {
        const json = {
          nodeCategory: target.key,
        };
        const res = await queryNodeList(json);
        target.isLoading = false;
        if (res.message === "成功") {
          target.isFold = false;
          target.hasChildren = true;
          target.children = res.data.map((item) => ({
            key: item.id,
            elType: item.nodeElType,
            title: item.nodeName,
            code: item.nodeCode,
            state: 3, // 0：成功：1：失败 2：正在执行，3：挂起中
            icon: target.icon,
            nodeCategory: target.key,
            isLeaf: true,
          }));
        } else {
          target.isFold = true;
          message.error(res.message);
        }
      };

      // 编辑分类
      const handleEdit = (e, id) => {
        e.stopPropagation();
        emit("editCategory", id);
      };

      // 删除分类
      const handleDelete = (e, id) => {
        e.stopPropagation();
        emit("deleteCategory", id);
      };

      watchEffect(() => {
        treeData.arr = props.data.arr;
      });

      return {
        treeData,
        selectedKey,
        handleClickTreeItem,
        handleDragStart,
        handleDelete,
        handleEdit,
      };
    },
  };
</script>
<style lang="less" scoped>
  .left-tree {
    height: 100%;
    overflow-y: auto;

    &-item {
      align-items: center;

      &.active {
        background-color: #e6f4ff;
      }

      &-title {
        width: 100%;
        height: 28px;
        display: flex;
        cursor: pointer;
        user-select: none;
        line-height: 28px;
        align-items: center;
        justify-content: space-between;

        .item-icon {
          width: 17px;
          height: 17px;
          color: #1776ff;
          margin: 0 8px 0 4px;
        }

        .status-icon {
          margin-bottom: 2px;
        }

        .title-text {
          font-size: 14px;
          overflow: hidden;
          color: #3c485c;
          white-space: nowrap;
          display: inline-block;
          text-overflow: ellipsis;
          width: calc(100% - 29px);
        }

        &-left {
          display: flex;
          align-items: center;
          width: calc(100% - 52px);
        }

        &-right {
          display: none;
          padding-right: 12px;

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

        &:hover {
          background-color: #e6f4ff;
          .left-tree-item-title-right {
            display: block !important;
          }
        }
      }

      &-children {
        display: flex;
        padding-left: 35px;
        transition: all 0.3s;
        flex-direction: column;

        .children-item {
          // width: 215px;
          display: flex;
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
          color: #3c485c;
          user-select: none;
          line-height: 20px;
          margin-bottom: 8px;
          border-radius: 2px;
          align-items: center;
          background: #f1f2f5;
          justify-content: space-between;
        }
      }
    }
  }
</style>
