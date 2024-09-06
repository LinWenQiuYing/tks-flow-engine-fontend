import axiosInstance from "./index.js";

const baseUrl = "/flowEngine/database";
const sourceUrl = "/flowEngine/datasource"

// 分页查询数据库列表
export async function queryDataBaseByPage(json) {
  const res = await axiosInstance.post(`${baseUrl}/queryDataBaseByPage`, json);
  return res;
}

// 分页查询数据源列表
export async function queryDatasourceByPage(json) {
  const res = await axiosInstance.post(`${sourceUrl}/queryDatasourceByPage`, json);
  return res;
}

// 新增/编辑数据源
export async function operationDatasource(json) {
  const res = await axiosInstance.post(`${sourceUrl}/operationDatasource`, json);
  return res;
}

// 新增/编辑数据库
export async function operationDatabase(json) {
  const res = await axiosInstance.post(`${baseUrl}/operationDatabase`, json);
  return res;
}

// 查询指定组件参数
export async function getDsList() {
  let res = await axiosInstance.get(`${sourceUrl}/queryDatasourceList`);
  return res;
}

// 删除数据源
export async function delDatasource(id) {
  const res = await axiosInstance.delete(
    `${sourceUrl}/delDatasource?id=${id}`
  );
  return res;
}

// 删除数据库
export async function delDatabase(id) {
  const res = await axiosInstance.delete(
    `${baseUrl}/delDatabase?id=${id}`
  );
  return res;
}
