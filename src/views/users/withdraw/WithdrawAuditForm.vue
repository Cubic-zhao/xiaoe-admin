<template>
  <el-dialog
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="visible"
    :title="dialogTitle"
    width="760px"
    center
    align-center
    @close="onClose"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="Record ID">{{ formModel.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Status">
        <el-tag effect="plain" :type="statusTagType(formModel.withdrawStatus)">{{ statusLabel(formModel.withdrawStatus) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="User">{{ formModel.nickname || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Mobile">{{ formModel.mobile || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Bank">{{ formModel.bankName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Card">{{ formModel.maskedCardNo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Holder">{{ formModel.holderName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Wallet">{{ walletSummary }}</el-descriptions-item>
      <el-descriptions-item label="Apply Amount">{{ formatAmount(formModel.withdrawAmount) }}</el-descriptions-item>
      <el-descriptions-item label="Actual Amount">{{ formatAmount(formModel.actualAmount) }}</el-descriptions-item>
      <el-descriptions-item label="Created At">{{ formModel.gmtCreate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Completed At">{{ formModel.completedAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Current Remark" :span="2">{{ formModel.failReason || formModel.remark || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="2" border style="margin-top: 16px">
      <el-descriptions-item label="Audit At">{{ formModel.auditAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Audit Result">{{ formModel.auditResultLabel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Timeline" :span="2">{{ formModel.auditTimelineSummary || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Wallet Replay" :span="2">{{ formModel.walletReplayHint || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Android Replay" :span="2">{{ formModel.androidReplayHint || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3" border style="margin-top: 16px">
      <el-descriptions-item label="Snapshot">Available</el-descriptions-item>
      <el-descriptions-item label="Snapshot">Frozen</el-descriptions-item>
      <el-descriptions-item label="Meaning">Description</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableBeforeApply) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeBeforeApply) }}</el-descriptions-item>
      <el-descriptions-item>Before apply</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.availableAmount) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.freezeAmount) }}</el-descriptions-item>
      <el-descriptions-item>Current</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableAfterApprove) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeAfterApprove) }}</el-descriptions-item>
      <el-descriptions-item>After approve</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableAfterReject) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeAfterReject) }}</el-descriptions-item>
      <el-descriptions-item>After reject</el-descriptions-item>
    </el-descriptions>

    <el-form
      v-if="mode !== 'view' && canEditAuditRemark"
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="110px"
      style="margin-top: 20px"
      @submit.prevent
    >
      <el-form-item :label="remarkLabel" prop="auditRemark">
        <el-input v-model="formModel.auditRemark" type="textarea" :rows="4" maxlength="255" show-word-limit :placeholder="remarkPlaceholder" />
      </el-form-item>
    </el-form>
    <div v-else-if="mode === 'pass'" class="audit-tip">
      当前账号未分配“审核备注”权限，仍可继续更新提现状态。
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">Close</el-button>
        <el-button v-if="mode !== 'view'" :loading="loading" :type="mode === 'reject' ? 'danger' : 'primary'" @click="onSubmit()">
          {{ confirmLabel }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { usersApi } from '@/api/users'
  import { hasPermission } from '@/utils/permission.js'

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const loading = ref(false)
  const mode = ref('view')
  const formRef = ref()

  const formDefault = {
    id: undefined,
    userId: undefined,
    mobile: '',
    nickname: '',
    availableAmount: 0,
    freezeAmount: 0,
    bankName: '',
    maskedCardNo: '',
    holderName: '',
    withdrawAmount: 0,
    feeAmount: 0,
    actualAmount: 0,
    withdrawStatus: '',
    gmtCreate: '',
    completedAt: '',
    remark: '',
    failReason: '',
    auditRemark: '',
    estimatedAvailableBeforeApply: 0,
    estimatedFreezeBeforeApply: 0,
    estimatedAvailableAfterApprove: 0,
    estimatedFreezeAfterApprove: 0,
    estimatedAvailableAfterReject: 0,
    estimatedFreezeAfterReject: 0,
    auditAt: '',
    auditResultLabel: '',
    auditTimelineSummary: '',
    androidReplayHint: '',
    walletReplayHint: ''
  }

  const formModel = reactive({ ...formDefault })

  const rules = {
    auditRemark: [
      {
        validator: (_, value, callback) => {
          if (mode.value === 'reject' && !value) {
            callback(new Error('Reject reason is required'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  }

  const dialogTitle = computed(() => {
    if (mode.value === 'pass') {
      return formModel.withdrawStatus === 'pending' ? 'Mark Withdraw Processing' : 'Mark Withdraw Success'
    }
    if (mode.value === 'reject') {
      return 'Reject Withdraw'
    }
    return 'Withdraw Detail'
  })

  const confirmLabel = computed(() => {
    if (mode.value === 'reject') {
      return 'Confirm Reject'
    }
    return formModel.withdrawStatus === 'pending' ? 'Confirm Processing' : 'Confirm Success'
  })

  const remarkLabel = computed(() => (mode.value === 'reject' ? 'Reject Reason' : 'Audit Note'))
  const remarkPlaceholder = computed(() => (mode.value === 'reject' ? 'Please provide a reject reason' : 'Optional audit note'))
  const walletSummary = computed(() => `Available ${formatAmount(formModel.availableAmount)} / Frozen ${formatAmount(formModel.freezeAmount)}`)
  const canEditAuditRemark = computed(() => mode.value === 'reject' || hasPermission('wallet:withdraw:audit:remark'))

  const onOpen = async (nextMode, item) => {
    Object.assign(formModel, formDefault)
    mode.value = nextMode
    const res = await usersApi.withdrawView({ id: item.id })
    Object.assign(formModel, { ...formDefault, ...res, auditRemark: '' })
    visible.value = true
  }
  defineExpose({ onOpen })

  const onSubmit = async () => {
    if (canEditAuditRemark.value) {
      const valid = await formRef.value.validate()
      if (!valid) return
    }
    if (loading.value) {
      ElMessage.warning('Processing...')
      return
    }

    loading.value = true
    try {
      if (mode.value === 'pass') {
        await usersApi.withdrawPass({
          id: formModel.id,
          remark: formModel.auditRemark || undefined
        })
        ElMessage.success('Withdraw status updated')
      } else {
        await usersApi.withdrawReject({
          id: formModel.id,
          remark: formModel.auditRemark
        })
        ElMessage.success('Withdraw rejected')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  const onClose = () => {
    Object.assign(formModel, formDefault)
    visible.value = false
    mode.value = 'view'
  }

  const formatAmount = (value) => {
    const amount = Number(value || 0)
    return amount.toFixed(2)
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'success':
        return 'Success'
      case 'failed':
        return 'Failed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status || 'Unknown'
    }
  }

  const statusTagType = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'processing':
        return 'primary'
      case 'success':
        return 'success'
      case 'failed':
        return 'danger'
      case 'cancelled':
        return 'info'
      default:
        return 'info'
    }
  }
</script>

<style scoped>
  .audit-tip {
    margin-top: 20px;
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
