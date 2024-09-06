<template>
  <a-layout class="flow-engine-layout">
    <a-layout-header class="flow-engine-layout-header">
      <div class="layout-header-logo">
        <img
          alt="融合平台"
          class="logo-img"
          src="@/assets/images/img/logo.svg"
        />
        <span class="logo-title">融合平台</span>
      </div>
      <a-menu
        v-model:selectedKeys="current"
        class="layout-menu"
        mode="horizontal"
      >
        <a-menu-item
          key="flow-manage"
          class="layout-menu-item"
          @click="handleChangeLink('flow-manage', 'flow-manage')"
        >
          <template #icon>
            <icon-svg
              className="layout-menu-item-img"
              icon-class="flow-manage"
            />
          </template>
          流程管理
        </a-menu-item>
        <a-menu-item
          key="job-manage"
          class="layout-menu-item"
          @click="handleChangeLink('job-manage', 'job-manage')"
        >
          <template #icon>
            <icon-svg
              className="layout-menu-item-img"
              icon-class="job-manage"
            />
          </template>
          运行任务管理
        </a-menu-item>
        <a-menu-item
          key="flow-edit"
          class="layout-menu-item"
          @click="handleChangeLink('flow-edit', 'flow-edit')"
        >
          <template #icon>
            <icon-svg className="layout-menu-item-img" icon-class="flow-edit" />
          </template>
          流程编排
        </a-menu-item>
        <a-sub-menu
          key="data-manage"
          class="layout-menu-submenu"
          popupClassName="layout-submenu-popup"
        >
          <template #icon>
            <icon-svg className="layout-submenu-img" icon-class="data-manage" />
          </template>
          <template #title>数据管理</template>
          <a-menu-item
            key="datasource-manage"
            class="layout-menu-item"
            @click="
              handleChangeLink('data-manage/datasource', 'datasource-manage')
            "
          >
            <template #icon>
              <img
                alt=""
                class="layout-menu-item-img"
                src="@/assets/images/img/data-source.png"
              />
            </template>
            <div class="title-text">数据源管理</div>
            <div class="title-sub">多元异构，快速适配多种数据源</div>
          </a-menu-item>
          <a-menu-item
            key="database-manage"
            class="layout-menu-item"
            @click="handleChangeLink('data-manage/database', 'database-manage')"
          >
            <template #icon>
              <img
                alt=""
                class="layout-menu-item-img"
                src="@/assets/images/img/data-base.png"
              />
            </template>
            <div class="title-text">数据库管理</div>
            <div class="title-sub">多元异构，快速适配多种数据源</div>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item
          key="component-manage"
          class="layout-menu-item"
          @click="handleChangeLink('component-manage', 'component-manage')"
        >
          <template #icon>
            <icon-svg
              className="layout-menu-item-img"
              icon-class="component-manage"
            />
          </template>
          组件管理
        </a-menu-item>
      </a-menu>
      <div class="layout-header-user">星小环</div>
    </a-layout-header>
    <a-layout-content class="flow-engine-layout-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>
<script>
  import { Layout, Menu } from "ant-design-vue";
  import { reactive, toRefs, onMounted, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const { Header, Content } = Layout;
  const { Item, SubMenu } = Menu;

  export default {
    name: "Layout",
    components: {
      ALayout: Layout,
      ALayoutHeader: Header,
      ALayoutContent: Content,
      AMenu: Menu,
      AMenuItem: Item,
      ASubMenu: SubMenu,
    },
    setup() {
      let obj = reactive({
        current: ["flow-manage"],
      });
      const router = useRouter();
      const route = useRoute();
      const handleChangeLink = (url, key) => {
        if (route.path === `/${url}`) {
          // 跳转路由与当前路由相同
          return;
        } else {
          obj.current = [key];
          router.push(`/${url}`);
        }
      };

      watch(
        () => route.path,
        (newValue, oldValue) => {
          switch (route.path) {
            case "/flow-manage":
              obj.current = ["flow-manage"];
              break;
            case "/job-manage":
              obj.current = ["job-manage"];
              break;
            case "/flow-edit":
              obj.current = ["flow-edit"];
              break;
            case "/data-manage/datasource":
              obj.current = ["datasource-manage"];
              break;
            case "/data-manage/database":
              obj.current = ["database-manage"];
              break;
            case "/component-manage":
              obj.current = ["component-manage"];
              break;
            default:
              obj.current = ["flow-manage"];
              break;
          }
        },
        { immediate: true }
      );

      onMounted(() => {});

      return {
        ...toRefs(obj),
        handleChangeLink,
      };
    },
  };
</script>
<style lang="less">
  .flow-engine-layout {
    width: 100%;
    height: 100%;
    min-width: 1280px;
    background: #ebedf1;

    &-header {
      padding: 0 24px;
      background: #fff;
      display: flex;
      height: 48px;
      z-index: 2;
      line-height: 48px;
      box-shadow: 0 0 8px rgba(31, 48, 78, 0.05);

      .layout-header-logo {
        display: flex;
        align-items: center;

        .logo-img {
          margin-right: 16px;
        }

        .logo-title {
          font-size: 20px;
          line-height: 28px;
          padding-right: 100px;
          color: #3c485c;
        }
      }

      .layout-header-user {
        width: 78px;
        display: flex;
        justify-content: flex-end;
      }

      .layout-menu {
        width: calc(100% - 305px);

        &-item {
          user-select: none;

          &.ant-menu-item-selected,
          &:hover {
            .layout-menu-item-img {
              color: #1776ff;
            }
          }
          &:focus-visible {
            box-shadow: none;
          }

          &-img {
            width: 16px;
            height: 16px;
            color: #5f7292;
          }
        }

        &-submenu {
          &.ant-menu-submenu-selected,
          &:hover {
            .ant-menu-submenu-title {
              .layout-submenu-img {
                color: #1776ff;
              }
            }
          }

          .ant-menu-submenu-title {
            .layout-submenu-img {
              width: 16px;
              height: 16px;
              color: #5f7292;
            }
          }
        }
      }
    }

    &-content {
      padding: 16px;
    }
  }

  .layout-submenu-popup {
    z-index: 3;
    width: 100%;
    height: 104px;
    left: 0px !important;
    background: #fafbfc;
    top: 48px !important;
    box-shadow: 0 4px 8px rgba(31, 48, 78, 0.1),
      0 20px 16px 4px rgba(31, 48, 78, 0.08);

    .ant-menu-sub {
      min-width: 915px;
      box-shadow: none;
      background: #fafbfc;
      height: 100%;
      display: flex;
      padding: 16px 16px 16px 251px;

      .layout-menu-item {
        width: 256px;
        height: 100%;
        padding: 16px;
        display: flex;
        border-radius: 6px;
        margin: 0 24px 0 0;

        &.ant-menu-item-selected,
        &:hover {
          background: #e6f4ff;

          .ant-menu-title-content {
            user-select: none;

            .title-text {
              color: #1776ff;
            }
          }
        }

        &-img {
          border-radius: 6px;
          box-shadow: 0 1px 4px rgb(23 118 255 / 26%),
            0 8px 10px rgb(23 118 255 / 21%);
        }

        .ant-menu-title-content {
          .title-text {
            height: 20px;
            line-height: 20px;
            color: #3c485c;
            font-weight: 600;
            margin-bottom: 3px;
          }

          .title-sub {
            height: 17px;
            line-height: 17px;
            font-size: 12px;
            color: #97a3b7;
          }
        }
      }
    }
  }
</style>
