<template>
  <el-drawer :model-value="visible" title="约课订单详情" size="560px" :destroy-on-close="true" @close="onClose">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="订单号">{{ model.orderNo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="课程">{{ model.courseName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学生">{{ model.studentName || '-' }} / UID: {{ model.userId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="讲师">{{ model.teacherName || '-' }} / UID: {{ model.teacherId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusType(model.status)" effect="plain">{{ statusLabel(model.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="上课方式">{{ deliveryModeLabel(model.deliveryMode) }}</el-descriptions-item>
      <el-descriptions-item label="首次上课">{{ formatTime(model.scheduledAt) }}</el-descriptions-item>
      <el-descriptions-item label="课时进度">{{ model.attendedHours || 0 }} / {{ model.totalHours || 0 }}</el-descriptions-item>
      <el-descriptions-item label="金额">{{ formatAmount(model.totalPrice) }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ model.location || '-' }}</el-descriptions-item>
      <el-descriptions-item label="取消原因">{{ model.cancelReason || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-drawer>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { usersApi } from '@/api/users'

  const visible = ref(false)
  const model = reactive({})

  const onOpen = async (row) => {
    Object.keys(model).forEach((key) => delete model[key])
    const res = await usersApi.bookingView({ id: row.id })
    Object.assign(model, res || row)
    visible.value = true
  }
  defineExpose({ onOpen })

  const onClose = () => {
    Object.keys(model).forEach((key) => delete model[key])
    visible.value = false
  }

  const statuses = {
    pending_pay: '待支付',
    paid: '已支付',
    in_progress: '进行中',
    completed: '已完成',
    canceled: '已取消'
  }
  const statusLabel = (value) => statuses[value] || value || '-'
  const statusType = (value) => ({ pending_pay: 'warning', paid: 'primary', in_progress: 'primary', completed: 'success', canceled: 'info' })[value] || 'info'
  const deliveryModeLabel = (value) => ({ onsite: '上门', online: '线上', both: '两种均可' })[value] || value || '-'
  const formatAmount = (value) => Number(value || 0).toFixed(2)
  const formatTime = (value) => (value ? new Date(Number(value)).toLocaleString() : '-')
</script>
