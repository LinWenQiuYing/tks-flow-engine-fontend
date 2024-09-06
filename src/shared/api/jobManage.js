import axiosInstance from "./index.js";

const taskUrl = "/flowEngine/flowTask";

// 查询任务列表
export async function queryTaskList(json) {
  const res = await axiosInstance.post(`${taskUrl}/queryChainList`, json);
  return res;
}

// 查询任务列表
export async function queryNodeLog(json) {
  const res = await axiosInstance.post(`${taskUrl}/queryNodeLog`, json);
  return res;
}

// 更新流程状态
export async function getTaskDetails(id) {
  const res = await axiosInstance.get(
    `${taskUrl}/queryTaskDetail?executeLogId=${id}`
  );
  return res;
}
