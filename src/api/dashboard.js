import { getRequest } from '@/utils/request'

export const statApi = {
  // 数据统计
  data: () => {
    return getRequest('/user/admin/stat/data')
  },
  // 用户注册登录统计
  login: () => {
    return getRequest('/user/admin/stat/login?dates=-14')
  },
  // 家教工作台今日待办
  o2o: () => {
    return getRequest('/user/admin/stat/o2o')
  },
  // 点播用量统计
  vod: () => {
    return getRequest('/system/admin/stat/vod')
  }
}
