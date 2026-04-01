<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.mobile" placeholder="User mobile" clearable />
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.nickname" placeholder="User nickname" clearable />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.withdrawStatus" clearable placeholder="Withdraw status" style="width: 180px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">Search</el-button>
            <el-button @click="resetQuery()">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="Record" min-width="90" prop="id" />
      <el-table-column label="User" min-width="180">
        <template #default="scope">
          <div>{{ scope.row.nickname || '-' }}</div>
          <div class="table-secondary">{{ scope.row.mobile || '-' }}</div>
          <div class="table-secondary">UID: {{ scope.row.userId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Bank" min-width="220">
        <template #default="scope">
          <div>{{ scope.row.bankName || '-' }}</div>
          <div class="table-secondary">{{ scope.row.maskedCardNo || '-' }}</div>
          <div class="table-secondary">{{ scope.row.holderName || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Amount" min-width="160">
        <template #default="scope">
          <div>Apply: {{ formatAmount(scope.row.withdrawAmount) }}</div>
          <div class="table-secondary">Fee: {{ formatAmount(scope.row.feeAmount) }}</div>
          <div class="table-secondary">Actual: {{ formatAmount(scope.row.actualAmount) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Wallet" min-width="160">
        <template #default="scope">
          <div>Available: {{ formatAmount(scope.row.availableAmount) }}</div>
          <div class="table-secondary">Frozen: {{ formatAmount(scope.row.freezeAmount) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Status" min-width="120">
        <template #default="scope">
          <el-tag effect="plain" :type="statusTagType(scope.row.withdrawStatus)">{{ statusLabel(scope.row.withdrawStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Timeline" min-width="180">
        <template #default="scope">
          <div>{{ scope.row.gmtCreate || '-' }}</div>
          <div class="table-secondary">{{ scope.row.completedAt || 'Pending completion' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Remark" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <div>{{ scope.row.failReason || scope.row.remark || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Actions" min-width="220">
        <template #default="scope">
          <el-button text type="primary" @click="openFormModal('view', scope.row)">View</el-button>
          <el-divider direction="vertical" />
          <el-button
            v-if="canPass(scope.row.withdrawStatus)"
            v-permission="'wallet:withdraw:audit:pass'"
            text
            type="primary"
            @click="openFormModal('pass', scope.row)"
          >
            {{ passActionLabel(scope.row.withdrawStatus) }}
          </el-button>
          <el-divider v-if="canReject(scope.row.withdrawStatus)" direction="vertical" />
          <el-button
            v-if="canReject(scope.row.withdrawStatus)"
            v-permission="'wallet:withdraw:audit:reject'"
            text
            type="danger"
            @click="openFormModal('reject', scope.row)"
          >
            Reject
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <withdraw-audit-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import WithdrawAuditForm from './WithdrawAuditForm.vue'

  const route = useRoute()
  const formRef = ref()

  const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' }
  ]

  const routeUserId = computed(() => {
    const raw = route.query.userId
    if (!raw) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : undefined
  })

  const { page, handlePage, query, handleQuery, resetQuery } = useTable(
    {
      page: usersApi.withdrawPage
    },
    routeUserId.value ? { userId: routeUserId.value } : {}
  )

  const openFormModal = (mode, item) => {
    formRef.value.onOpen(mode, item)
  }

  const formatAmount = (value) => {
    const amount = Number(value || 0)
    return amount.toFixed(2)
  }

  const statusLabel = (status) => {
    const target = statusOptions.find((item) => item.value === status)
    return target ? target.label : status || 'Unknown'
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

  const canPass = (status) => status === 'pending' || status === 'processing'
  const canReject = (status) => status === 'pending' || status === 'processing'
  const passActionLabel = (status) => (status === 'pending' ? 'Mark Processing' : 'Mark Success')
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
