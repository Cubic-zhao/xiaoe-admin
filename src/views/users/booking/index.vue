<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="学生ID">
            <el-input v-model="query.userId" clearable />
          </el-form-item>
          <el-form-item label="讲师ID">
            <el-input v-model="query.teacherId" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" clearable style="width: 140px">
              <el-option v-for="item in bookingStatuses" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-table-column label="订单" min-width="190">
        <template #default="scope">
          <div>{{ scope.row.orderNo || '-' }}</div>
          <div class="table-secondary">ID: {{ scope.row.id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课程" min-width="220">
        <template #default="scope">
          <div>{{ scope.row.courseName || '-' }}</div>
          <div class="table-secondary">课程ID: {{ scope.row.courseId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="学生/讲师" min-width="210">
        <template #default="scope">
          <div>{{ scope.row.studentName || '-' }} / UID: {{ scope.row.userId }}</div>
          <div class="table-secondary">{{ scope.row.teacherName || '-' }} / UID: {{ scope.row.teacherId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课时" min-width="130">
        <template #default="scope">
          <div>{{ scope.row.attendedHours || 0 }} / {{ scope.row.totalHours || 0 }}</div>
          <div class="table-secondary">{{ deliveryModeLabel(scope.row.deliveryMode) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="首次上课" min-width="180">
        <template #default="scope">{{ formatTime(scope.row.scheduledAt) }}</template>
      </el-table-column>
      <el-table-column label="金额" min-width="120">
        <template #default="scope">{{ formatAmount(scope.row.totalPrice) }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="120">
        <template #default="scope">
          <el-tag :type="bookingStatusType(scope.row.status)" effect="plain">{{ bookingStatusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="170">
        <template #default="scope">
          <el-button text type="primary" @click="detailRef.onOpen(scope.row)">查看</el-button>
          <el-divider v-if="scope.row.status === 'pending_pay'" direction="vertical" />
          <el-button
            v-if="scope.row.status === 'pending_pay'"
            v-permission="'user:booking:cancel'"
            text
            type="danger"
            @click="cancelBooking(scope.row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <booking-detail-drawer ref="detailRef" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import BookingDetailDrawer from './BookingDetailDrawer.vue'

  const detailRef = ref()
  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.bookingPage
  })

  const bookingStatuses = [
    { label: '待支付', value: 'pending_pay' },
    { label: '已支付', value: 'paid' },
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'canceled' }
  ]

  const cancelBooking = (row) => {
    ElMessageBox.prompt('请输入取消原因', '取消约课订单', {
      inputType: 'textarea',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    }).then(async ({ value }) => {
      await usersApi.bookingCancel({ id: row.id, reason: value })
      ElMessage.success('操作成功')
      handlePage()
    })
  }

  const bookingStatusLabel = (value) => {
    const target = bookingStatuses.find((item) => item.value === value)
    return target ? target.label : value || '-'
  }
  const bookingStatusType = (value) => ({ pending_pay: 'warning', paid: 'primary', in_progress: 'primary', completed: 'success', canceled: 'info' })[value] || 'info'
  const deliveryModeLabel = (value) => ({ onsite: '上门', online: '线上', both: '两种均可' })[value] || value || '-'
  const formatAmount = (value) => Number(value || 0).toFixed(2)
  const formatTime = (value) => (value ? new Date(Number(value)).toLocaleString() : '-')
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
