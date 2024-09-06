import axiosInstance from "./index.js";

const nodeUrl = "/flowEngine/node";
const categoryUrl = "/flowEngine/category";

// 组件列表查询
export async function nodeListQuery(json) {
  const res = await axiosInstance.post(`${nodeUrl}/nodeListQuery`, json);
  return res;
}

// 添加组件配置
export async function addNodeConfig(json) {
  const res = await axiosInstance.post(`${nodeUrl}/addNodeConfig`, json);
  return res;
}

// 查看组件的配置信息
export async function nodeConfigDetail(id) {
  const res = await axiosInstance.get(
    `${nodeUrl}/nodeConfigDetail?nodeId=${id}`
  );
  return res;
}

// 获取字段类型
export async function queryDictionaryByType(type) {
  const res = await axiosInstance.get(
    `${nodeUrl}/queryDictionaryByType?dicType=${type}`
  );
  return res;
}

// 删除组件
export async function deleteNode(type) {
  const res = await axiosInstance.get(`${nodeUrl}/deleteNode?dicType=${type}`);
  return res;
}

// 查询分类
export async function queryCategory() {
  const res = await axiosInstance.get(`${categoryUrl}/queryCategory`);
  return res;
}

// 下载示例
export async function scriptDownLoad() {
  const res = await axiosInstance.get(
    encodeURI(`${nodeUrl}/getFile?path=/deploy/script.txt`),
    {
      responseType: "blob",
    }
  );
  return res;
}

// 新建分类
export async function addCategory(json) {
  const res = await axiosInstance.post(`${categoryUrl}/addCategory`, json);
  return res;
}

// 添加脚本组件
export async function addScriptNodeConfig(json) {
  const res = await axiosInstance.post(`${nodeUrl}/addScriptNodeConfig`, json);
  return res;
}

// 删除分类
export async function deleteCategory(id) {
  const res = await axiosInstance.delete(
    `${categoryUrl}/deleteCategory?id=${id}`
  );
  return res;
}
