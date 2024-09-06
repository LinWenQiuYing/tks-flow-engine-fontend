<template>
  <div :class="['data-list', className]">
    <div class="data-list-loading" v-show="isLoading">
      <a-spin :spinning="isLoading" tip="正在查询" size="large" />
    </div>
    <div class="data-list-item add-item" @click="handleAdd">
      <plus-outlined :style="{ fontSize: '20px' }" />
      <span class="item-text" v-if="checkType === 'base'">新增数据库</span>
      <span class="item-text" v-else>新增数据源</span>
    </div>
    <div class="data-list-item" v-for="item in dataList" :key="item.id">
      <div class="item-btns">
        <edit-outlined class="item-btns-icon" @click="handleEdit(item)" />
        <icon-svg
          className="item-btns-icon"
          iconClass="action-delete"
          @click="handleDelete(item.id)"
        />
      </div>
      <div class="item-header">
        <div class="item-header-img">
          <img :src="item.icon" alt="" />
        </div>
        <div class="item-header-name">
          <span class="item-header-name-text">{{ item.name }}</span>
          <span class="item-header-name-date">{{ item.date }}</span>
        </div>
      </div>
      <span class="item-text">{{ item.desc }}</span>
    </div>
  </div>
</template>
<script>
  import { modalConfirm } from "@/utils/common";
  import { Input, message, Select, Spin } from "ant-design-vue";
  import { delDatabase, delDatasource } from "@/shared/api/dataManage";

  export default {
    name: "DataList",
    props: {
      className: {
        type: String,
        default: "",
        required: false,
      },
      isLoading: {
        type: Boolean,
        default: false,
        required: false,
      },
      dataList: {
        type: Array,
        default: [],
        required: true,
      },
      checkType: {
        type: String,
        required: true,
      },
    },
    components: {
      AInput: Input,
      ASelect: Select,
      ASpin: Spin,
    },
    setup(props, { emit }) {
      // 编辑数据库方法
      const handleEdit = (target) => {
        emit("handleEdit", target);
      };

      // 删除数据库方法
      const handleDelete = (id) => {
        const title = "数据源（库）删除提示！";
        const content = "此操作将永久删除该数据源（库），请确认是否继续？";
        let res = null;
        const onOk = async () => {
          if (props.checkType === "base") {
            // 删除数据库
            res = await delDatabase(id);
          } else {
            // 删除数据源
            res = await delDatasource(id);
          }
          if (res.message === "成功") {
            emit("handleSearch");
            message.success("数据源（库）删除成功！");
          } else {
            message.error(res.message);
          }
        };
        modalConfirm(title, content, onOk);
      };

      // 点击新增按钮
      const handleAdd = () => {
        emit("handleAdd");
      };

      return {
        handleEdit,
        handleDelete,
        handleAdd,
      };
    },
  };
</script>
<style lang="less" scoped>
  .data-list {
    gap: 16px;
    display: grid;
    position: relative;
    height: calc(100% - 80px);
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

    &-item {
      display: flex;
      padding: 16px;
      cursor: pointer;
      overflow: hidden;
      position: relative;
      border-radius: 6px;
      flex-direction: column;
      border: 1px solid #d6dbe3;
      justify-content: space-between;

      &.add-item {
        color: #1776ff;
        padding: 32px 16px;
        justify-content: space-around;

        .item-text {
          color: #1776ff;
          text-align: center;
        }
      }

      &:hover {
        border-color: #1776ff;
        box-shadow: 0px 1px 4px rgba(23, 118, 255, 0.26),
          0px 8px 10px rgba(23, 118, 255, 0.21);

        .item-btns {
          display: flex;
        }
      }

      .item-btns {
        top: 16px;
        right: 16px;
        height: 14px;
        display: none;
        position: absolute;

        &-icon {
          width: 14px;
          height: 14px;
          color: #97a3b7;

          &:hover {
            color: #1776ff;
          }

          &:first-child {
            margin-right: 7px;
          }
        }
      }

      .item-header {
        display: flex;
        align-items: center;

        &-img {
          width: 48px;
          height: 48px;
          margin-right: 8px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        &-name {
          display: flex;
          flex-direction: column;
          width: calc(100% - 56px);

          &-text,
          &-date {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          &-text {
            color: #3c485c;
            font-weight: 600;
            font-size: 16px;
            line-height: 23x;
            margin-bottom: 8px;
          }

          &-date {
            line-height: 17px;
            font-size: 12px;
            color: #97a3b7;
          }
        }
      }

      .item-text {
        height: 22px;
        line-height: 22px;
        color: #3c485c;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    &-loading {
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      position: absolute;
      background: #fff;
      align-items: center;
      justify-content: center;
    }
  }
</style>
