import { createRouter, createWebHashHistory } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const layout = () => import(/* webpackChunkName: "layout" */ "@/layout");
const flowEdit = () =>
  import(/* webpackChunkName: "flowEdit" */ "@/views/flowEdit");
const jobManage = () =>
  import(/* webpackChunkName: "jobManage" */ "@/views/jobManage");
const flowManage = () =>
  import(/* webpackChunkName: "flowManage" */ "@/views/flowManage");
const dataManage = () =>
  import(/* webpackChunkName: "dataManage" */ "@/views/dataManage");
const datasource = () =>
  import(/* webpackChunkName: "datasource" */ "@/views/dataManage/datasource");
const database = () =>
  import(/* webpackChunkName: "database" */ "@/views/dataManage/database");
const componentManage = () =>
  import(/* webpackChunkName: "componentManage" */ "@/views/componentManage");

const routes = [
  {
    path: "/",
    name: "layout",
    component: layout,
    redirect: "flow-manage",
    children: [
      {
        path: "flow-manage",
        name: "flowManage",
        component: flowManage,
      },
      {
        path: "job-manage",
        name: "jobManage",
        component: jobManage,
      },
      {
        path: "flow-edit",
        name: "flowEdit",
        component: flowEdit,
      },
      {
        path: "data-manage",
        name: "dataManage",
        component: dataManage,
        children: [
          {
            path: "datasource",
            name: "datasource",
            component: datasource,
          },
          {
            path: "database",
            name: "database",
            component: database,
          },
        ],
      },
      {
        path: "component-manage",
        name: "componentManage",
        component: componentManage,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;

// 全局路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start();
  next();

  // if (
  //   store.state.rightsOptions.userInfo &&
  //   store.state.rightsOptions.userInfo.token
  // ) {
  //   if (to.path === "/login") {
  //     next(false);
  //   } else {
  //     next();
  //   }
  // } else {
  //   if (to.path === "/login") {
  //     next();
  //   } else {
  //     message.error("登陆超时，请重新登陆！", 2);
  //     next({
  //       name: "pierceLogin",
  //       params: {
  //         target: window.location.pathname,
  //       },
  //     });
  //   }
  // }
});

router.afterEach(() => {
  NProgress.done();
});