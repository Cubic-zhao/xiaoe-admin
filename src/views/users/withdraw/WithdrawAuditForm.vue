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
      <el-descriptions-item label="记录 ID">{{ formModel.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag effect="plain" :type="statusTagType(formModel.withdrawStatus)">{{ statusLabel(formModel.withdrawStatus) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="用户">{{ formModel.nickname || '-' }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ formModel.mobile || '-' }}</el-descriptions-item>
      <el-descriptions-item label="收款银行">{{ formModel.bankName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="银行卡">{{ formModel.maskedCardNo || '-' }}</el-descriptions-item>
      <el-descriptions-item label="持卡人">{{ formModel.holderName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="钱包">{{ walletSummary }}</el-descriptions-item>
      <el-descriptions-item label="申请金额">{{ formatAmount(formModel.withdrawAmount) }}</el-descriptions-item>
      <el-descriptions-item label="实到金额">{{ formatAmount(formModel.actualAmount) }}</el-descriptions-item>
      <el-descriptions-item label="申请时间">{{ formModel.gmtCreate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="完成时间">{{ formModel.completedAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="当前备注" :span="2">{{ formModel.failReason || formModel.remark || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="2" border style="margin-top: 16px">
      <el-descriptions-item label="审核时间">{{ formModel.auditAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="审核结果">{{ formModel.auditResultLabel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="处理记录" :span="2">{{ formModel.auditTimelineSummary || '-' }}</el-descriptions-item>
      <el-descriptions-item label="钱包变动" :span="2">{{ formModel.walletReplayHint || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3" border style="margin-top: 16px">
      <el-descriptions-item label="余额快照">可用</el-descriptions-item>
      <el-descriptions-item label="余额快照">冻结</el-descriptions-item>
      <el-descriptions-item label="时点">说明</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableBeforeApply) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeBeforeApply) }}</el-descriptions-item>
      <el-descriptions-item>申请前</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.availableAmount) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.freezeAmount) }}</el-descriptions-item>
      <el-descriptions-item>当前</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableAfterApprove) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeAfterApprove) }}</el-descriptions-item>
      <el-descriptions-item>审核通过后</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedAvailableAfterReject) }}</el-descriptions-item>
      <el-descriptions-item>{{ formatAmount(formModel.estimatedFreezeAfterReject) }}</el-descriptions-item>
      <el-descriptions-item>驳回后</el-descriptions-item>
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
        <el-button @click="onClose()">关闭</el-button>
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
    walletReplayHint: ''
  }

  const formModel = reactive({ ...formDefault })

  const rules = {
    auditRemark: [
      {
        validator: (_, value, callback) => {
          if (mode.value === 'reject' && !value) {
            callback(new Error('请填写驳回原因'))
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
      return formModel.withdrawStatus === 'pending' ? '审核通过，标记为打款中' : '标记提现已到账'
    }
    if (mode.value === 'reject') {
      return '驳回提现申请'
    }
    return '提现详情'
  })

  const confirmLabel = computed(() => {
    if (mode.value === 'reject') {
      return '确认驳回'
    }
    return formModel.withdrawStatus === 'pending' ? '确认通过' : '确认已到账'
  })

  const remarkLabel = computed(() => (mode.value === 'reject' ? '驳回原因' : '审核备注'))
  const remarkPlaceholder = computed(() => (mode.value === 'reject' ? '请填写驳回原因，用户可见' : '审核备注（选填）'))
  const walletSummary = computed(() => `可用 ${formatAmount(formModel.availableAmount)} / 冻结 ${formatAmount(formModel.freezeAmount)}`)
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
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return
    }
    if (loading.value) {
      ElMessage.warning('正在处理···')
      return
    }

    loading.value = true
    try {
      if (mode.value === 'pass') {
        await usersApi.withdrawPass({
          id: formModel.id,
          remark: formModel.auditRemark || undefined
        })
        ElMessage.success('提现状态已更新')
      } else {
        await usersApi.withdrawReject({
          id: formModel.id,
          remark: formModel.auditRemark
        })
        ElMessage.success('已驳回提现申请')
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
        return '待审核'
      case 'processing':
        return '打款中'
      case 'success':
        return '已到账'
      case 'failed':
        return '已驳回'
      case 'cancelled':
        return '已取消'
      default:
        return status || '-'
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
