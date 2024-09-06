import axiosInstance from "./index.js";

const chainUrl = "/flowEngine/chain";
const nodeUrl = "/flowEngine/node";

// 查询左侧树状组件列表
export async function queryNodeList(json) {
  const res = await axiosInstance.post(
    `${chainUrl}/queryDoneNodeByCategory`,
    json
  );
  return res;
}

// 新建流程
export async function createFlow(json) {
  const res = await axiosInstance.post(`${chainUrl}/saveChain`, json);
  return res;
}

// 获取左侧分类树组件
export async function getNodeTree(nodeType) {
  let res = null;
  if (nodeType) {
    res = await axiosInstance.get(
      `${chainUrl}/queryChainNodeTree?nodeType=${nodeType}`
    );
  } else {
    res = await axiosInstance.get(`${chainUrl}/queryChainNodeTree?nodeType=1`);
  }
  return res;
}

// 查询指定组件参数
export async function getNodeParams(id) {
  let res = await axiosInstance.get(`${chainUrl}/queryNodeParams?nodeId=${id}`);
  return res;
}

// 获取新的tagid
export async function getTagId() {
  let res = await axiosInstance.get(`${nodeUrl}/getTagId`);
  return res;
}
