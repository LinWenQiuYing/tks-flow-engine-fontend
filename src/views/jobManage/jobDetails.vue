<template>
  <div class="job-details">
    <div class="job-details-header">
      <span class="header-text">{{ details.chainName }}</span>
      <a-button type="primary" @click="handleReturn" class="header-btn">
        返回
      </a-button>
    </div>
    <a-tabs
      v-model:activeKey="activeKey"
      animated
      hideAdd
      type="editable-card"
      class="job-details-tabs"
      @edit="onEdit"
      @change="handleChangeTab"
    >
      <a-tab-pane key="result" :closable="false">
        <template #tab>
          <span class="tab-title-box">
            <icon-svg icon-class="excute-result" class="item-icon" />
            执行结果
          </span>
        </template>
        <div class="result-content">
          <div class="result-content-header">
            <div class="result-content-header-item">
              <div class="item-label">执行时间：</div>
              <div class="item-value">{{ details.startDate }}</div>
            </div>
            <div class="result-content-header-item">
              <div class="item-label">结束时间：</div>
              <div class="item-value">{{ details.endDate }}</div>
            </div>
            <div class="result-content-header-item">
              <div class="item-label">执行状态：</div>
              <div
                :class="[
                  'item-value',
                  details.status === 0
                    ? 'success'
                    : details.status === 1
                    ? 'fail'
                    : details.status === 2
                    ? 'loading'
                    : 'not-do',
                ]"
              >
                <img
                  class="item-value-icon"
                  src="@/assets/images/img/icon-success.svg"
                  alt=""
                  v-if="details.status === 0"
                />
                <img
                  class="item-value-icon"
                  src="@/assets/images/img/icon-fail.svg"
                  alt=""
                  v-else-if="details.status === 1"
                />
                <img
                  class="item-value-icon"
                  src="@/assets/images/img/icon-ing.svg"
                  alt=""
                  v-else-if="details.status === 2"
                />
                <img
                  class="item-value-icon"
                  src="@/assets/images/img/icon-notdo.svg"
                  alt=""
                  v-else
                />
                {{ details.statusText }}
              </div>
            </div>
          </div>
          <div class="result-content-graph">
            <FlowGraph
              checkType="check"
              parentType="job"
              :graphData="graphData"
              @addPane="addPane"
            />
          </div>
          <div class="result-content-details" v-html="details.result"></div>
        </div>
      </a-tab-pane>
      <a-tab-pane v-for="pane in panes" :key="pane.tagId">
        <template #tab>
          <span class="tab-title-box">
            <img
              class="item-status"
              src="@/assets/images/img/icon-success.svg"
              alt=""
              v-if="pane.status === 0"
            />
            <img
              class="item-status"
              src="@/assets/images/img/icon-fail.svg"
              alt=""
              v-else-if="pane.status === 1"
            />
            <img
              class="item-status"
              src="@/assets/images/img/icon-ing.svg"
              alt=""
              v-else-if="pane.status === 2"
            />
            <img
              class="item-status"
              src="@/assets/images/img/icon-notdo.svg"
              alt=""
              v-else
            />
            <icon-svg :icon-class="pane.icon" class="item-icon" />
            {{ pane.title }}
          </span>
        </template>
        <div class="result-content">
          <a-tabs class="result-content-tabs">
            <a-tab-pane key="log" tab="过程日志">
              <div class="result-content-tabs-log">
                <!-- <div class="log-header">
                  共有日志
                  <span class="log-header-allNum">99</span>
                  条，错误日志
                  <span class="log-header-errNum">3</span>
                  条
                </div> -->
                <div class="log-content" v-if="id">
                  <div class="log-content-item">
                    <div class="log-content-item-label">[批次号]：</div>
                    <div class="log-content-item-value">{{ id }}</div>
                  </div>
                  <div class="log-content-item" v-if="tagId">
                    <div class="log-content-item-label">[节点tag值]：</div>
                    <div class="log-content-item-value">{{ tagId }}</div>
                  </div>
                  <div class="log-content-item" v-if="time">
                    <div class="log-content-item-label">[执行时间]：</div>
                    <div class="log-content-item-value">{{ time }}</div>
                  </div>
                  <div class="log-content-item" v-if="status">
                    <div class="log-content-item-label">[状态]：</div>
                    <div class="log-content-item-value">{{ status }}</div>
                  </div>
                  <div class="log-content-item" v-if="inParams">
                    <div class="log-content-item-label">[节点入参]：</div>
                    <div class="log-content-item-value">{{ inParams }}</div>
                  </div>
                  <div class="log-content-item" v-if="outParams">
                    <div class="log-content-item-label">[节点结果]：</div>
                    <div class="log-content-item-value">{{ outParams }}</div>
                  </div>
                  <div class="log-content-item" v-if="errorMsg">
                    <div class="log-content-item-label">[异常信息]：</div>
                    <div class="log-content-item-value">{{ errorMsg }}</div>
                  </div>
                </div>
                <div class="log-content" v-else>暂无日志数据</div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
  import { queryNodeLog } from "@/shared/api/jobManage";
  import { resetData } from "@/utils/common";
  import FlowGraph from "@/views/flowEdit/components/flowGraph";
  import { Button, Tabs, message } from "ant-design-vue";
  import dayjs from "dayjs";
  import { find, findIndex } from "lodash";
  import { reactive, ref, toRefs } from "vue";

  const { TabPane } = Tabs;

  export default {
    name: "JobDetails",
    components: {
      AButton: Button,
      ATabs: Tabs,
      ATabPane: TabPane,
      FlowGraph,
    },
    props: {
      details: {
        type: Object,
        required: true,
      },
      graphData: {
        type: Object,
        required: true,
      },
    },
    setup(props, { emit }) {
      // tabs-activeKey
      let activeKey = ref("result");
      let panes = ref([]);
      const logDetail = reactive({
        id: undefined,
        tagId: undefined,
        time: undefined,
        status: undefined,
        inParams: undefined,
        outParams: undefined,
        errorMsg: undefined,
      });

      // 顶部点击返回按钮方法
      const handleReturn = () => {
        emit("detailShowChange", false);
      };

      // 点击组件添加pane方法
      const addPane = (nodeData) => {
        const index = findIndex(panes.value, (v) => v.tagId === nodeData.tag);
        if (index === -1) {
          panes.value.push({
            key: nodeData.key,
            title: nodeData.label,
            icon: nodeData.icon,
            tagId: nodeData.tag, // 区分相同组件
            status: nodeData.state,
          });
        }
        //跳转对应tab
        handleChangeTab(nodeData.tag);
      };

      // 移除当前tab
      const remove = (targetKey) => {
        let lastIndex = 0; // 找到需要删除的tab的前一个tab的index
        panes.value.forEach((pane, i) => {
          if (pane.tagId === targetKey) {
            lastIndex = i - 1;
          }
        });
        // 下面是在当activeKey为当前需要删除的targetKey时，需要重新给activeKey赋值
        if (panes.value.length && activeKey.value === targetKey) {
          if (lastIndex >= 0) {
            activeKey.value = panes.value[lastIndex].tagId;
          } else {
            activeKey.value = "result";
          }
        }
        panes.value = panes.value.filter((pane) => pane.tagId !== targetKey); // 实际删除步骤
      };

      // tabs编辑事件
      const onEdit = (targetKey) => {
        remove(targetKey);
      };

      // 切换tab
      const handleChangeTab = async (key) => {
        activeKey.value = key;
        const target = find(panes.value, (v) => v.tagId === key);
        console.log("target", target, panes.value);
        if (target) {
          const json = {
            batchId: props.details.id,
            nodeTag: target.tagId,
          };
          const res = await queryNodeLog(json);
          if (res.message === "成功" && res.data) {
            logDetail.id = res.data.batchId;
            logDetail.tagId = res.data.nodeTag;
            logDetail.time = res.data.executeDate
              ? dayjs(res.data.executeDate).format("YYYY-MM-DD HH:mm:ss")
              : "";
            logDetail.status =
              res.data.status === 0
                ? "成功"
                : res.data.status === 1
                ? "失败"
                : res.data.status === 2
                ? "正在执行"
                : "挂起中";
            logDetail.inParams = res.data.params;
            logDetail.outParams = res.data.nodeContext;
            logDetail.errorMsg = res.data.errMsg;
            target.status = res.data.status;
          } else if (res.message === "成功" && !res.data) {
            resetData(logDetail);
            message.info("暂无日志数据");
          } else {
            message.error(res.message);
          }
        }
      };

      return {
        panes,
        activeKey,
        ...toRefs(logDetail),
        handleReturn,
        addPane,
        onEdit,
        handleChangeTab,
      };
    },
  };
</script>
<style lang="less">
  .job-details {
    width: 100%;
    height: 100%;
    padding: 16px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0px 2px 8px rgb(31 48 78 / 5%),
      0px 10px 16px 4px rgb(31 48 78 / 4%);

    &-header {
      height: 40px;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      justify-content: space-between;

      .header-text {
        font-size: 20px;
        font-weight: 600;
        color: #3c485c;
      }
    }

    &-tabs {
      height: calc(100% - 56px);

      .ant-tabs-nav {
        &-wrap {
          .ant-tabs-nav-list {
            .ant-tabs-tab {
              border-radius: 6px 6px 0 0;
              background: #fafbfc;
              border: 1px solid #d6dbe3;

              &.ant-tabs-tab-active {
                color: #1776ff;
                background: #fff;
                border-bottom-color: #fff;

                .tab-title-box {
                  color: #1776ff;
                }
              }

              &-btn {
                .tab-title-box {
                  display: flex;
                  color: #3c485c;
                  align-items: center;

                  .item-status {
                    margin-right: 4px;
                  }

                  .item-icon {
                    width: 16px;
                    height: 16px;
                    margin-right: 4px;
                  }
                }
              }
            }
          }
        }
      }

      .ant-tabs-content-holder {
        .ant-tabs-content {
          height: 100%;

          .result-content {
            height: 100%;
            display: flex;
            flex-wrap: wrap;

            &-header {
              width: 100%;
              height: 20px;
              display: flex;
              padding-left: 16px;
              align-items: center;
              margin-bottom: 16px;

              &-item {
                display: flex;
                align-items: center;

                &:not(:last-child) {
                  margin-right: 150px;
                }

                .item-label {
                  color: #97a3b7;
                  margin-right: 8px;
                }

                .item-value {
                  display: flex;
                  color: #3c485c;
                  align-items: center;

                  &.success {
                    color: #1bb46d;
                  }

                  &.fail {
                    color: #e31430;
                  }

                  &.loading {
                    color: #1776ff;
                  }

                  &.not-do {
                    color: #97a3b7;
                  }

                  &-icon {
                    margin-right: 4px;
                  }
                }
              }
            }

            &-graph {
              width: 80%;
              height: calc(100% - 36px);
              border: 1px solid #d6dbe3;
            }

            &-details {
              width: 20%;
              padding: 16px;
              border-left: 0;
              color: #3c485c;
              line-height: 20px;
              overflow-y: auto;
              overflow-x: hidden;
              height: calc(100% - 36px);
              border: 1px solid #d6dbe3;
            }

            &-tabs {
              width: 100%;
              height: 100%;

              .ant-tabs-nav {
                &::before {
                  border: none;
                }

                &-wrap {
                  .ant-tabs-nav-list {
                    .ant-tabs-tab {
                      border: none;
                      padding: 13px 4px;
                    }
                  }
                }
              }

              &-log {
                height: 100%;
                border: 1px solid #d6dbe3;

                .log-header {
                  width: 100%;
                  height: 42px;
                  color: #3c485c;
                  line-height: 42px;
                  text-align: center;
                  background-color: #fafbfc;

                  &-allNum {
                    color: #1776ff;
                  }

                  &-errNum {
                    color: #e31430;
                  }
                }

                .log-content {
                  width: 100%;
                  height: 100%;
                  padding: 16px;
                  overflow: auto;

                  &-item {
                    display: flex;
                    color: #3c485c;
                    line-height: 22px;

                    &-label {
                      width: 90px;
                      text-align: right;
                    }

                    &-value {
                      word-wrap: break-word;
                      width: calc(100% - 90px);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>
