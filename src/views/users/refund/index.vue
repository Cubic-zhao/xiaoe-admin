<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-select v-model="query.refundStatus" clearable placeholder="退款状态" style="width: 160px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.orderNo" placeholder="订单号" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.applySource" clearable placeholder="来源" style="width: 160px">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="订单 / 退款单" min-width="210">
        <template #default="scope">
          <div>{{ scope.row.orderNo }}</div>
          <div class="table-secondary">退款单 {{ scope.row.refundNo }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="150">
        <template #default="scope">
          <div>{{ scope.row.userName || '-' }}</div>
          <div class="table-secondary">{{ scope.row.userMobile || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课程" min-width="160" show-overflow-tooltip>
        <template #default="scope">{{ scope.row.courseName || '-' }}</template>
      </el-table-column>
      <el-table-column label="金额" min-width="150">
        <template #default="scope">
          <div>退款 ¥{{ formatAmount(scope.row.refundAmount) }}</div>
          <div class="table-secondary">实付 ¥{{ formatAmount(scope.row.payAmount) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" min-width="110">
        <template #default="scope">
          <enum-view :enum-name="'PayTypeEnum'" :enum-value="scope.row.payType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="110">
        <template #default="scope">
          <el-tag effect="plain" :type="statusTagType(scope.row.refundStatus)">{{ scope.row.refundStatusLabel || scope.row.refundStatus }}</el-tag>
          <div class="table-secondary">{{ sourceLabel(scope.row.applySource) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="原因 / 处理说明" min-width="240" show-overflow-tooltip>
        <template #default="scope">
          <div>{{ scope.row.applyReason || '-' }}</div>
          <div class="table-secondary">{{ scope.row.auditRemark || scope.row.providerMsg || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="时间" min-width="170">
        <template #default="scope">
          <div>{{ scope.row.gmtCreate || '-' }}</div>
          <div class="table-secondary">{{ scope.row.successTime ? '退款成功 ' + scope.row.successTime : scope.row.auditTime ? '审核 ' + scope.row.auditTime : '待处理' }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="180">
        <template #default="scope">
          <template v-if="scope.row.refundStatus === 'applied'">
            <el-button v-permission="'user:order:refund:approve'" text type="primary" @click="handleApprove(scope.row)">通过</el-button>
            <el-button v-permission="'user:order:refund:reject'" text type="danger" @click="handleReject(scope.row)">驳回</el-button>
          </template>
          <el-button v-else-if="scope.row.refundStatus === 'processing'" v-permission="'user:order:refund:sync'" text type="primary" @click="handleSync(scope.row)">同步结果</el-button>
          <span v-else class="table-secondary">已结束</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
  </div>
</template>

<script setup>
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'

  // 退款状态与来源取值见 docs/sql/20261027_order_refund.sql
  const statusOptions = [
    { label: '待审核', value: 'applied' },
    { label: '退款中', value: 'processing' },
    { label: '已退款', value: 'success' },
    { label: '退款失败', value: 'failed' },
    { label: '已驳回', value: 'rejected' }
  ]
  const sourceOptions = [
    { label: '用户申请', value: 'user' },
    { label: '后台发起', value: 'admin' },
    { label: '历史数据迁移', value: 'legacy_fail' }
  ]

  const { page, handlePage, query, handleQuery, resetQuery } = useTable({ page: usersApi.refundPage })

  const formatAmount = (value) => Number(value || 0).toFixed(2)
  const sourceLabel = (value) => sourceOptions.find((item) => item.value === value)?.label || value || '-'

  const statusTagType = (status) => {
    switch (status) {
      case 'applied':
        return 'warning'
      case 'processing':
        return 'primary'
      case 'success':
        return 'success'
      case 'failed':
        return 'danger'
      default:
        return 'info'
    }
  }

  const runAction = async (action, successMessage) => {
    page.loading = true
    try {
      await action()
      ElMessage.success(successMessage)
    } finally {
      await handlePage()
    }
  }

  const handleApprove = async (row) => {
    let remark = ''
    try {
      const result = await ElMessageBox.prompt(
        `确认通过订单 ${row.orderNo} 的退款申请？通过后立即向支付平台发起退款 ¥${formatAmount(row.refundAmount)}，款项退回后订单与课程权益会被收回，不能撤销。`,
        '退款审核通过',
        { confirmButtonText: '确认通过并退款', cancelButtonText: '取消', inputPlaceholder: '审核意见（选填）', type: 'warning' }
      )
      remark = result.value || ''
    } catch {
      return
    }
    await runAction(() => usersApi.refundApprove({ id: row.id, remark }), '已提交退款，结果以支付平台为准')
  }

  const handleReject = async (row) => {
    let remark = ''
    try {
      const result = await ElMessageBox.prompt(`驳回订单 ${row.orderNo} 的退款申请，订单保持已支付，用户会收到驳回原因。`, '驳回退款申请', {
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
        inputPlaceholder: '驳回原因（必填）',
        inputValidator: (value) => (value && value.trim() ? true : '请填写驳回原因'),
        type: 'warning'
      })
      remark = result.value.trim()
    } catch {
      return
    }
    await runAction(() => usersApi.refundReject({ id: row.id, remark }), '已驳回')
  }

  const handleSync = async (row) => {
    await runAction(() => usersApi.refundSync({ id: row.id }), '已同步支付平台结果')
  }
</script>

<style scoped>
  .table-secondary {
    color: var(--xe-ink-500);
    font-size: 12px;
    line-height: 1.6;
  }
</style>
