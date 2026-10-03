<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="约课ID">
            <el-input v-model="query.bookingId" clearable />
          </el-form-item>
          <el-form-item label="学生ID">
            <el-input v-model="query.userId" clearable />
          </el-form-item>
          <el-form-item label="讲师ID">
            <el-input v-model="query.teacherId" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" clearable style="width: 140px">
              <el-option v-for="item in scheduleStatuses" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-table-column label="排课" min-width="160">
        <template #default="scope">
          <div>ID: {{ scope.row.id }}</div>
          <div class="table-secondary">约课ID: {{ scope.row.bookingId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课程" min-width="220">
        <template #default="scope">{{ scope.row.courseName || '-' }}</template>
      </el-table-column>
      <el-table-column label="学生/讲师" min-width="210">
        <template #default="scope">
          <div>{{ scope.row.studentName || '-' }} / UID: {{ scope.row.userId }}</div>
          <div class="table-secondary">{{ scope.row.teacherName || '-' }} / UID: {{ scope.row.teacherId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="时间" min-width="210">
        <template #default="scope">
          <div>{{ formatTime(scope.row.startAt) }}</div>
          <div class="table-secondary">{{ formatTime(scope.row.endAt) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课次" min-width="90">
        <template #default="scope">{{ scope.row.periodIndex || 0 }} / {{ scope.row.periodTotal || 0 }}</template>
      </el-table-column>
      <el-table-column label="上课方式" min-width="110">
        <template #default="scope">{{ deliveryModeLabel(scope.row.deliveryMode) }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="120">
        <template #default="scope">
          <el-tag :type="scheduleStatusType(scope.row.status)" effect="plain">{{ scheduleStatusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.status !== 'completed' && scope.row.status !== 'canceled'"
            v-permission="'user:schedule:adjust'"
            text
            type="primary"
            @click="adjustRef.onOpen(scope.row)"
          >
            调整
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <schedule-adjust-dialog ref="adjustRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import ScheduleAdjustDialog from './ScheduleAdjustDialog.vue'

  const adjustRef = ref()
  const route = useRoute()
  const routeBookingId = Array.isArray(route.query.bookingId) ? route.query.bookingId[0] : route.query.bookingId
  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.schedulePage
  })
  query.bookingId = routeBookingId || ''

  const scheduleStatuses = [
    { label: '已确认', value: 'confirmed' },
    { label: '等待中', value: 'waiting' },
    { label: '进行中', value: 'in_progress' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'canceled' }
  ]
  const scheduleStatusLabel = (value) => {
    const target = scheduleStatuses.find((item) => item.value === value)
    return target ? target.label : value || '-'
  }
  const scheduleStatusType = (value) => ({ confirmed: 'primary', waiting: 'warning', in_progress: 'primary', completed: 'success', canceled: 'info' })[value] || 'info'
  const deliveryModeLabel = (value) => ({ onsite: '上门', online: '线上', both: '两种均可' })[value] || value || '-'
  const formatTime = (value) => (value ? new Date(Number(value)).toLocaleString() : '-')
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
