<template>
  <div
    :class="['flow-graph', className]"
    @drop.native="handleDrop"
    @dragover="(e) => e.preventDefault()"
  >
    <div class="middle-canvas" ref="graphContainer"></div>
    <div class="middle-minimap" ref="minimapContainer"></div>
  </div>
</template>
<script>
  import { getNodeParams, getTagId } from "@/shared/api/flowEdit";
  import { Graph, Path } from "@antv/x6";
  import { message } from "ant-design-vue";
  import { cloneDeep } from "lodash";
  import { nanoid } from "nanoid";
  import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useRoute } from "vue-router";

  export default {
    name: "FlowGraph",
    props: {
      className: {
        type: String,
        default: "",
      },
      checkType: {
        type: String,
        required: true,
      },
      parentType: {
        type: String,
        required: true,
      },
      // 图谱数据
      graphData: {
        type: [Object, null],
        default: null,
      },
    },
    setup(props, { emit }) {
      // 图谱容器
      const graphContainer = ref(null);
      const minimapContainer = ref(null);
      // 图对象
      let graph = null;

      let selectedNode = reactive({
        data: undefined,
      }); // 当前选中的组件
      const route = useRoute(); // 路由

      // 链接桩
      const ports = {
        groups: {
          top: {
            position: "top",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
              },
            },
          },
          // right: {
          //   position: "right",
          //   attrs: {
          //     circle: {
          //       r: 4,
          //       magnet: true,
          //       stroke: "#5F95FF",
          //       strokeWidth: 1,
          //       fill: "#fff",
          //     },
          //   },
          // },
          bottom: {
            position: "bottom",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 1,
                fill: "#fff",
              },
            },
          },
          // left: {
          //   position: "left",
          //   attrs: {
          //     circle: {
          //       r: 4,
          //       magnet: true,
          //       stroke: "#5F95FF",
          //       strokeWidth: 1,
          //       fill: "#fff",
          //     },
          //   },
          // },
        },
        // items: [
        //   {
        //     group: "top",
        //   },
        //   // {
        //   //   group: "right",
        //   // },
        //   {
        //     group: "bottom",
        //   },
        //   // {
        //   //   group: "left",
        //   // },
        // ],
      };

      // 获取图谱所需的点边结构的配置项
      const createNodeOption = (node, type) => {
        let className = "custom-node"; // 组件class
        let stroke = "#1776FF"; // 组件边的颜色
        switch (node.state) {
          // 0：成功：1：失败 2：正在执行，3：挂起中
          case 0:
            className += " success";
            stroke = "#1BB46D";
            break;

          case 1:
            className += " fail";
            stroke = "#E31430";
            break;

          case 2:
            className += " loading";
            break;

          default:
            break;
        }
        const option = {
          id: node.id,
          data: node.data,
          shape: "custom-node",
          label: node.data.label,
          x: type === "create" ? node.position.x : node.position.x - 96,
          y: type === "create" ? node.position.y : node.position.y - 16,
          attrs: {
            body: {
              className,
              stroke,
            },
            back: {
              fill: stroke,
              stroke,
            },
            icon: {
              "xlink:href": require(`@/assets/images/img/nodeCategoryIcon/${node.data.icon}.svg`),
            },
            status: {
              "xlink:href":
                node.state === 0
                  ? require(`@/assets/images/img/node-status-success.svg`)
                  : node.state === 1
                  ? require(`@/assets/images/img/node-status-fail.svg`)
                  : node.state === 2
                  ? require(`@/assets/images/img/node-status-ing.svg`)
                  : null,
            },
          },
          ports: node.ports,
        };
        return option;
      };
      const createEdgeOption = (edge) => {
        const option = {
          id: edge.id,
          shape: "custom-edge",
          source: edge.source,
          target: edge.target,
          zIndex: 1,
        };
        return option;
      };

      // 初始化图谱
      const initGraph = () => {
        Graph.registerNode(
          "custom-node",
          {
            inherit: "rect",
            width: 196,
            height: 32,
            markup: [
              {
                tagName: "rect",
                selector: "body",
                className: "custom-node",
              },
              {
                tagName: "rect",
                selector: "back",
              },
              {
                tagName: "image",
                selector: "icon",
              },
              {
                tagName: "text",
                selector: "label",
              },
              {
                tagName: "rect",
                selector: "box",
              },
              {
                tagName: "image",
                selector: "status",
                className: "status-icon",
              },
            ],
            attrs: {
              body: {
                rx: 6,
                ry: 6,
                width: 192,
                height: 32,
                stroke: "#1776FF",
                fill: "#fff",
                class: "custom-node",
              },
              back: {
                rx: 4,
                ry: 4,
                refX: 2,
                refY: 2,
                width: 35,
                height: 28,
                fill: "#1776FF",
                stroke: "#1776FF",
              },
              box: {
                x: 34,
                y: 2,
                rx: 0,
                ry: 0,
                width: 4,
                height: 28,
                fill: "#fff",
                stroke: "#fff",
              },
              icon: {
                width: 18,
                height: 18,
                refX: 7,
                refY: 7,
              },
              label: {
                refX: 44,
                refY: 9,
                lineHeight: 20,
                textAnchor: "left",
                textVerticalAnchor: "top",
                fontSize: 14,
                fill: "#3C485C",
              },
              status: {
                width: 14,
                height: 14,
                refX: 170,
                refY: 9,
              },
            },
            ports: { ...ports },
          },
          true
        );

        Graph.registerEdge(
          "custom-edge",
          {
            inherit: "edge",
            attrs: {
              line: {
                stroke: "#BCC4D0",
                strokeWidth: 1,
                targetMarker: {
                  name: "block",
                  width: 10,
                  height: 12,
                },
              },
            },
          },
          true
        );

        Graph.registerConnector(
          "algo-connector",
          (s, e) => {
            const offset = 4;
            const deltaY = Math.abs(e.y - s.y);
            const control = Math.floor((deltaY / 3) * 2);

            const v1 = { x: s.x, y: s.y + offset + control };
            const v2 = { x: e.x, y: e.y - offset - control };

            return Path.normalize(
              `M ${s.x} ${s.y}
                L ${s.x} ${s.y + offset}
                C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
                L ${e.x} ${e.y}
              `
            );
          },
          true
        );

        graph = new Graph({
          container: graphContainer.value,
          autoResize: true,
          panning: {
            // 拖拽平移
            enabled: true,
            // modifiers: "shift",
            eventTypes: ["leftMouseDown", "mouseWheel"],
          },
          grid: true,
          background: {
            color: "#FBFBFB", // 设置画布背景颜色
          },
          snapline: true, // 对齐线
          scroller: {
            // 滚动画布
            enabled: true,
            pannable: true,
          },
          minimap: {
            enabled: true,
            container: minimapContainer,
          },
          mousewheel: {
            enabled: true,
            modifiers: "ctrl", // 设置修饰键后需要按下修饰键并滚动鼠标滚轮时才触发画布缩放。通过设置修饰键可以解决默认滚动行为与画布缩放冲突问题
            factor: 1.2, // 滚动缩放因子
            maxScale: 2.5,
            minScale: 0.5,
          },
          highlighting: {
            default: {
              name: "stroke",
              args: {
                attrs: {
                  fill: "#fff",
                  stroke: "#31d0c6",
                  strokeWidth: 4,
                },
              },
            },
          },
          connecting: {
            // 配置全局的连线规则
            snap: true, // 当 snap 设置为 true 时连线的过程中距离组件或者连接桩 50px 时会触发自动吸附，可以通过配置 radius 属性自定义触发吸附的距离
            allowBlank: false, // 是否允许连接到画布空白位置的点
            allowLoop: false, // 是否允许创建循环连线，即边的起始组件和终止组件为同一组件
            allowNode: false, // 是否允许边链接到组件（非组件上的链接桩）
            highlight: true,
            connector: "algo-connector",
            // connectionPoint: "anchor",
            anchor: "center",
            validateMagnet({ magnet }) {
              // 只能从非上方的链接桩进行连接
              return magnet.getAttribute("port-group") !== "top";
            },
            createEdge() {
              return graph.addEdge({
                shape: "custom-edge",
              });
            },
          },
          selecting: {
            // 不生效，不知为啥
            enabled: true,
            multiple: false, // 多选
            rubberEdge: true, // 框选
            rubberNode: true, // 框选
            modifiers: "shift", // 修饰键，设置修饰键后需要点击鼠标并按下修饰键才能触发框选
            rubberband: true, // 框选
          },
        });

        // graph.bindKey();

        // 控制连接桩显示/隐藏
        // const showPorts = (ports, show) => {
        //   for (let i = 0, len = ports.length; i < len; i = i + 1) {
        //     ports[i].style.visibility = show ? "visible" : "hidden";
        //   }
        // };

        // 重置组件选中状态
        const reset = () => {
          const nodes = graph.getNodes();
          nodes.forEach((node) => {
            node.attr("body/class", "custom-node");
          });
        };

        // 点击组件事件
        graph.on("node:click", async ({ e, node, view }) => {
          // 设置class--以修改样式
          reset();
          selectedNode.data = node; // selectedNode赋值
          node.attr("body/class", "custom-node selected");
          if (props.checkType === "check" && props.parentType === "job") {
            /* 如果是查看流程引擎页面，则点击会新增当前组件的tab页，点击tab页查看当前组件的日志 */
            emit("addPane", node.data);
          } else {
            /* 如果是新增流程引擎页面，则点击会展示组件参数 */
            emit("handleChangeIsRightPartShow", true); // 展示右侧组件参数区域
            // 获取组件参数
            let inputList = cloneDeep(node.data.inputList);
            emit("handleInputList", inputList);
          }
        });

        // 点击画布事件
        graph.on("blank:click", ({ e, x, y }) => {
          reset();
          selectedNode.data = undefined; // selectedNode重置
          if (!props.checkType) return;
          emit("handleChangeIsRightPartShow", false); // 展示右侧组件参数区域
        });

        // 初始化组件/边
        const init = (data) => {
          const cells = data.map((cell) => {
            if (cell.shape === "custom-node") {
              const option = createNodeOption(
                {
                  ...cell,
                  data: {
                    ...cell.data,
                    state: cell.state,
                  },
                },
                "create"
              );
              return graph.createNode(option);
            } else {
              const option = createEdgeOption(cell);
              return graph.createEdge(option);
            }
          });
          graph.resetCells(cells);
        };

        if (props.checkType !== "add") {
          init(props.graphData.cells);
          graph.centerContent();
        }
      };

      // drag function
      const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        let data = e.dataTransfer.getData("data");
        data = JSON.parse(data);
        const point = graph.pageToLocal(e.x, e.y);
        const res1 = await getTagId();
        if (res1.message === "成功" && res1.data) {
          // 给data添加以下属性
          data.position = {
            x: point.x,
            y: point.y,
          };
          let inputList = [];
          let hasRequiredInput = false; // 是否含有必填项
          const res2 = await getNodeParams(data.key);
          if (res2.message === "成功") {
            inputList = res2.data.map((item) => {
              if (item.proRequired === 1) {
                // 只要有，就设为true
                hasRequiredInput = true;
              }
              return {
                id: item.id,
                nodeId: item.nodeId, // 该条数据对应的组件的id，跟getNodeParams接口的入参对应
                title: item.paramCsName, // 中文名
                type: item.inputFormat, // 输入类型：输入框，下拉框，文本域，时间选择器等，，1、文本框; 2、文本域; 3: 下拉框，4、时间;
                esName: item.paramEsName, // 英文名
                //required: item.proRequired === 0 ? true : false, // 是否必填(0：必填，1：非必填)
                required: item.proRequired === 1 ? true : false, // 是否必填(1：必填，0：非必填)
                options: JSON.parse(item.enumValue), // 如果是下拉框，则该项是其的options todo--该值待逻辑完善
              };
            });
          } else {
            message.error(res2.message);
          }
          data.data = {
            // 存放业务数据
            tag: res1.data, // 区分相同组件
            key: data.key,
            code: data.code,
            icon: data.icon,
            label: data.title,
            elType: data.elType,
            state: data.state,
            hasRequiredInput,
            nodeCategory: data.nodeCategory,
            inputList,
          };
          data.id = nanoid();
          data.ports = [
            {
              id: data.id + "-1",
              group: "top",
            },
            {
              id: data.id + "-2",
              group: "bottom",
            },
          ];
          selectedNode.data = data;
          const cell = createNodeOption(data, "add");
          graph.addNode(cell);
        } else {
          message.error("获取组件tag失败");
        }
      };

      // 保存组件参数信息方法
      const handleSaveNodeData = (data) => {
        selectedNode.data.data.inputList = data;
      };

      // 获取图谱数据方法
      const getGraphData = () => {
        // const graphData = {
        //   nodes: graph.getNodes(),
        //   edges: graph.getEdges(),
        // };
        const graphData = graph.toJSON();
        graphData.cells.map((cell) => {
          if (cell.shape === "custom-node") {
            cell.state = cell.data.state;
          }
        });
        return graphData;
      };

      // 键盘输入事件
      const handleKeyDown = (e) => {
        // kgraph组件会监听键盘输入事件，在这里组织冒泡，kgraph就监听不到了
        e.stopPropagation();
        // 因为这里会全局监听，故在此加个路由的限制，只允许在流程编排图谱页生效
        if (route.name !== "flowEdit") return;
        if (e.keyCode === 46 && graph && selectedNode.data) {
          e.preventDefault();
          graph.removeNode(selectedNode.data.id);
        }
      };

      // 获取图谱实例对象方法
      const getGraph = () => {
        return graph;
      };

      onMounted(() => {
        initGraph();
        // 监听delete删除元素 && 同时防止输入事件冒泡--kgraph组件会监听键盘输入事件，在这里组织冒泡，kgraph就监听不到了
        document.body.addEventListener("keydown", handleKeyDown);
      });

      if (props.graphData) {
        watch(props.graphData, (newValue) => {
          initGraph();
        });
      }

      onBeforeUnmount(() => {
        document.body.removeEventListener("keydown", handleKeyDown);
      });

      return {
        handleSaveNodeData,
        graphContainer,
        minimapContainer,
        handleDrop,
        getGraphData,
        getGraph,
        selectedNode,
      };
    },
  };
</script>
<style lang="less">
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .flow-graph {
    width: 100%;
    height: 100%;
    position: relative;

    .middle-canvas {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .middle-minimap {
      width: 188px;
      height: 140px;
      position: absolute;
      left: 16px;
      bottom: 16px;
    }

    .custom-node {
      box-shadow: 0px 10px 16px 4px rgba(31, 48, 78, 0.04);
      &.selected {
        filter: drop-shadow(0px 0px 4px rgba(23, 118, 255, 0.33))
          drop-shadow(0px 0px 8px rgba(23, 118, 255, 0.33));
      }
    }

    // .status-icon {
    //   animation: spin 1s linear infinite;
    //   transform-origin: 7px 7px;
    // }
  }
</style>
