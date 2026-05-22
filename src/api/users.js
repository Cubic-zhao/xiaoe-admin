import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const usersApi = {
  // users account consume save
  usersAccountConsumeSave: (data) => {
    return postRequest('/user/admin/users/account/consume/save', data)
  },
  // users account consume page
  usersAccountConsumePage: (data) => {
    return postRequest('/user/admin/users/account/consume/page', data)
  },

  // lecturer page
  lecturerPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/lecturer/page', { pageCurrent, pageSize, ...params })
  },
  // lecturer view
  lecturerView: (data) => {
    return getRequest('/user/admin/lecturer/view?id=' + data.id)
  },
  // lecturer edit
  lecturerEdit: (data) => {
    return putRequest('/user/admin/lecturer/edit', data)
  },
  // lecturer sort
  lecturerSort: (data) => {
    return putRequest('/user/admin/lecturer/sort', data)
  },
  // lecturer save
  lecturerSave: (data) => {
    return postRequest('/user/admin/lecturer/save', data)
  },
  // lecturer delete
  lecturerDelete: (data) => {
    return deleteRequest('/user/admin/lecturer/delete?id=' + data.id)
  },

  // users page
  usersPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/users/page', { pageCurrent, pageSize, ...params })
  },
  // users edit
  usersEdit: (data) => {
    return putRequest('/user/admin/users/edit', data)
  },
  usersView: (data) => {
    return getRequest('/user/admin/users/view?id=' + data.id)
  },
  // users delete
  usersDelete: (data) => {
    return deleteRequest('/user/admin/users/delete?id=' + data.id)
  },

  // login log page
  logLoginPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/users/log/page', { pageCurrent, pageSize, ...params })
  },

  // user course page
  userCoursePage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/course/admin/user/course/page', { pageCurrent, pageSize, ...params })
  },

  // order page
  orderInfoPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/order/info/page', { pageCurrent, pageSize, ...params })
  },
  orderEdit: (data) => {
    return putRequest('/user/admin/order/info/edit', data)
  },
  orderInfoStat: (data) => {
    return getRequest('/user/admin/order/info/stat?userId=' + data.userId)
  },

  // wallet withdraw audit page
  withdrawPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/wallet/withdraw/page', { pageCurrent, pageSize, ...params })
  },
  withdrawView: (data) => {
    return getRequest('/user/admin/wallet/withdraw/view?id=' + data.id)
  },
  withdrawPass: (data) => {
    return putRequest('/user/admin/wallet/withdraw/pass', data)
  },
  withdrawReject: (data) => {
    return putRequest('/user/admin/wallet/withdraw/reject', data)
  },
  rechargeReconcileStats: (data = {}) => {
    return getRequest('/user/admin/wallet/recharge/reconcile/stats?recentHours=' + (data.recentHours || 24))
  },
  rechargeReconcileRun: (data = {}) => {
    return postRequest('/user/admin/wallet/recharge/reconcile/run?timeoutMinutes=' + (data.timeoutMinutes || 30), {})
  },

  // message page
  msgPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/msg/page', { pageCurrent, pageSize, ...params })
  },
  // message view
  msgView: (data) => {
    return getRequest('/user/admin/msg/view?id=' + data.id)
  },
  // message effect
  msgEffect: (data) => {
    return getRequest('/user/admin/msg/effect?id=' + data.id)
  },
  // message save
  msgSave: (data) => {
    return postRequest('/user/admin/msg/save', data)
  },
  // message dispatch
  msgDispatch: (data) => {
    return postRequest('/user/admin/msg/dispatch', data)
  },
  // message edit
  msgEdit: (data) => {
    return putRequest('/user/admin/msg/edit', data)
  },
  // message delete
  msgDelete: (data) => {
    return deleteRequest('/user/admin/msg/delete?id=' + data.id)
  },
  // message delivery page
  msgUserPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/msg/user/page', { pageCurrent, pageSize, ...params })
  },

  tutorQualificationPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/tutor/qualification/page', { pageCurrent, pageSize, ...params })
  },
  tutorQualificationView: (data) => {
    return getRequest('/user/admin/tutor/qualification/view?id=' + data.id)
  },
  tutorQualificationApprove: (data) => {
    return putRequest('/user/admin/tutor/qualification/approve', data)
  },
  tutorQualificationReject: (data) => {
    return putRequest('/user/admin/tutor/qualification/reject', data)
  },
  tutorIntroPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/tutor/intro/page', { pageCurrent, pageSize, ...params })
  },
  tutorIntroEdit: (data) => {
    return putRequest('/user/admin/tutor/intro/edit', data)
  },
  tutorOperationPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/tutor/operation/page', { pageCurrent, pageSize, ...params })
  },
  tutorOperationConfig: (data) => {
    return putRequest('/user/admin/tutor/operation/config', data)
  },

  bookingPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/booking/page', { pageCurrent, pageSize, ...params })
  },
  bookingView: (data) => {
    return getRequest('/user/admin/booking/view?id=' + data.id)
  },
  bookingCancel: (data) => {
    return putRequest('/user/admin/booking/cancel', data)
  },
  schedulePage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/schedule/page', { pageCurrent, pageSize, ...params })
  },
  scheduleAdjust: (data) => {
    return putRequest('/user/admin/schedule/adjust', data)
  },
  lessonRecordView: (data) => {
    return getRequest('/user/admin/lesson/record/view?scheduleId=' + data.scheduleId)
  },
  tutorRelationPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/tutor/relation/page', { pageCurrent, pageSize, ...params })
  },
  tutorRelationProgress: (data) => {
    return getRequest('/user/admin/tutor/relation/progress?relationId=' + data.relationId)
  },

  feedbackPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/user/admin/feedback/page', { pageCurrent, pageSize, ...params })
  },
  feedbackView: (data) => {
    return getRequest('/user/admin/feedback/view?id=' + data.id)
  },
  feedbackReply: (data) => {
    return putRequest('/user/admin/feedback/reply', data)
  },
  feedbackClose: (data) => {
    return putRequest('/user/admin/feedback/close', data)
  },
  feedbackReopen: (data) => {
    return putRequest('/user/admin/feedback/reopen', data)
  }
}
