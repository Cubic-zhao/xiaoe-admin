import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/cookie.js'
import router from '@/router/index.js'
import { PATH } from '@/utils/constants/system'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken
let sessionExpiredNotified = false // 302-305 登出提示只弹一次

// create an axios instance
const request = axios.create({
  baseURL: PATH.URL_GATEWAY, // url = request url + base url
  timeout: 60000 // request timeout
})

// request interceptor
request.interceptors.request.use(
  (config) => {
    removePending(config, true) // 在一个ajax发送前执行一下取消操作
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    config.cancelToken = new CancelToken((c) => {
      // 这里的ajax标识用：请求地址&请求方式拼接的字符串
      pending.push({ u: config.url + '&' + config.method, f: c })
    })
    return config
  },
  (error) => {
    console.error(error)
    return Promise.reject(error)
  }
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    removePending(
      {
        url: response.config.url ? response.config.url.replace(PATH.URL_GATEWAY, '') : '',
        method: response.config.method
      },
      false
    )
    const res = response.data
    if (res.code === 200) {
      return Promise.resolve(res.data)
    }

    if (res.code === 301) {
      // token过期
      removeToken()
      router.push(PATH.URL_LOGIN).then(() => {
        ElMessage.error('登录已过期，请重新登录')
        location.reload() // 重新实例化vue-router对象
      })
      return Promise.reject(response)
    }

    if (res.code === 302 || res.code === 303 || res.code === 304 || res.code === 305) {
      // 302token异常，303登录异常，304异地登录，305菜单过期：并发请求只弹一次，任何关闭方式都登出
      if (!sessionExpiredNotified) {
        sessionExpiredNotified = true
        ElMessageBox.alert(res.msg ? `${res.msg}，请重新登录` : '登录状态已失效，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          type: 'warning',
          showClose: false,
          closeOnPressEscape: false
        }).finally(() => {
          removeToken()
          location.reload() // 重新实例化vue-router对象
        })
      }
      return Promise.reject(response)
    }

    if (res.code === 306) {
      // 权限不足：只提示，不离开当前页面（路由级无权限由守卫处理）
      ElMessage.error(res.msg || '权限不足，请联系管理员')
      return Promise.reject(response)
    }

    // 其他异常
    ElMessage.error({ message: res.msg || '操作失败，请稍后重试', duration: 5 * 1000 })
    return Promise.reject(response)
  },
  (error) => {
    const message = httpErrorMessage(error)
    if (message) {
      ElMessage.error({ message, duration: 5 * 1000 })
    }
    return Promise.reject(error)
  }
)

/**
 * HTTP 层错误提示；被取消的请求不提示
 */
const httpErrorMessage = (error) => {
  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
    return ''
  }
  const status = error?.response?.status
  if (status === 500 && error.response.data?.msg) {
    return error.response.data.msg
  }
  if (status === 413) {
    return '文件过大，请压缩后重试'
  }
  if (status === 502 || status === 503 || status === 504) {
    return '服务暂不可用，请稍后重试'
  }
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return '请求超时，请稍后重试'
  }
  if (!error?.response) {
    return '网络连接失败，请检查网络后重试'
  }
  return error.response.data?.msg || `请求失败（${status}），请稍后重试`
}

const removePending = (config, isCancel) => {
  for (const p in pending) {
    // 枚举不处理
    if (config.url.indexOf('enum') === -1) {
      if (pending[p].u === config.url + '&' + config.method) {
        // 当前请求在数组中存在时执行函数体
        if (isCancel) {
          pending[p].f() // 执行取消操作
        }
        pending.splice(Number(p), 1) // 把这条记录从数组中移除
      }
    }
  }
}

/**
 * post请求
 */
export const postRequest = (url, data = {}) => {
  return request({ url: url, data: data ? data : {}, method: 'post' })
}

/**
 * get请求
 */
export const getRequest = (url) => {
  return request({ url: url, method: 'get' })
}

/**
 * put请求
 */
export const putRequest = (url, data = {}) => {
  return request({ url: url, data: data ? data : {}, method: 'put' })
}

/**
 * delete请求
 */
export const deleteRequest = (url) => {
  return request({ url: url, method: 'delete' })
}

export const upload = (url, file, fileName, cb, cancelFun) => {
  const formData = new FormData()
  formData.append(fileName, file)
  const config = {
    onUploadProgress: (progressEvent) => {
      const percent = Number(((progressEvent.loaded / progressEvent.total) * 100).toFixed(2))
      // 计算上传进度
      if (cb) {
        cb(percent)
      }
    }
  }
  if (cancelFun) {
    config.cancelToken = new axios.CancelToken(function excutor(c) {
      cancelFun.cancel = c
    })
  }

  return request.post(url, formData, config)
}
