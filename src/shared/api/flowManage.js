import axiosInstance from "./index.js";

const chainUrl = "/flowEngine/chain";

// 查询流程列表
export async function queryChainList(json) {
  const res = await axiosInstance.post(`${chainUrl}/queryChainList`, json);
  return res;
}

// 更新流程状态
export async function updateChainStatus(json) {
  const res = await axiosInstance.post(`${chainUrl}/updateChainStatus`, json);
  return res;
}

// 立即执行流程
export async function executeFlow(id) {
  let res = await axiosInstance.get(`${chainUrl}/executeChain?chainId=${id}`);
  return res;
}

// 查询流程详情
export async function queryChainDetails(id) {
  let res = await axiosInstance.get(`${chainUrl}/queryChainDetails?id=${id}`);
  return res;
}

// 查看流程schema
export async function viewChainSchema(id) {
  let res = await axiosInstance.get(`${chainUrl}/viewChainSchema/${id}`);
  return res;
}

// 发布流程
export async function publishChain(json) {
  let res = await axiosInstance.post(`${chainUrl}/publishChain`, json, {
    timeout: -1,
  });
  return res;
}
