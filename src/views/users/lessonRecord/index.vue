<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="约课ID">
            <el-input-number v-model="query.bookingId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="学生ID">
            <el-input-number v-model="query.userId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="讲师ID">
            <el-input-number v-model="query.teacherId" :min="1" controls-position="right" clearable />
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
      <el-table-column label="上课时间" min-width="210">
        <template #default="scope">
          <div>{{ formatTime(scope.row.startAt) }}</div>
          <div class="table-secondary">{{ formatTime(scope.row.endAt) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课次" min-width="90">
        <template #default="scope">{{ scope.row.periodIndex || 0 }} / {{ scope.row.periodTotal || 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" min-width="120">
        <template #default="scope">
          <el-tag :type="scheduleStatusType(scope.row.status)" effect="plain">{{ scheduleStatusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="100">
        <template #default="scope">
          <el-button text type="primary" @click="recordRef.onOpen(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <el-drawer :model-value="visible" title="课后记录" size="560px" :destroy-on-close="true" @close="onClose">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程">{{ detail.schedule?.courseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生">{{ detail.schedule?.studentName || '-' }} / UID: {{ detail.schedule?.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="讲师">{{ detail.schedule?.teacherName || '-' }} / UID: {{ detail.schedule?.teacherId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ formatTime(detail.schedule?.startAt) }}</el-descriptions-item>
        <el-descriptions-item label="课堂记录">{{ detail.record?.note || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作业">{{ detail.record?.homework || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作业截止">{{ formatTime(detail.record?.homeworkDueAt) }}</el-descriptions-item>
        <el-descriptions-item label="学生评分">{{ detail.record?.studentRating || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生评价">{{ detail.record?.studentReview || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail.record?.attachments || []" style="margin-top: 16px">
        <el-table-column label="附件">
          <template #default="scope">{{ scope.row }}</template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'

  const route = useRoute()
  const visible = ref(false)
  const detail = reactive({})
  const recordRef = {
    onOpen: async (row) => {
      Object.keys(detail).forEach((key) => delete detail[key])
      const res = await usersApi.lessonRecordView({ scheduleId: row.id })
      Object.assign(detail, res || {})
      visible.value = true
    }
  }

  const { page, handlePage, query, handleQuery, resetQuery } = useTable(
    {
      page: usersApi.schedulePage
    },
    {
      status: 'completed',
      bookingId: route.query.bookingId ? Number(route.query.bookingId) : undefined
    }
  )

  const onClose = () => {
    Object.keys(detail).forEach((key) => delete detail[key])
    visible.value = false
  }

  const scheduleStatusLabel = (value) => ({ confirmed: '已确认', waiting: '等待中', in_progress: '进行中', completed: '已完成', canceled: '已取消' })[value] || value || '-'
  const scheduleStatusType = (value) => ({ confirmed: 'primary', waiting: 'warning', in_progress: 'primary', completed: 'success', canceled: 'info' })[value] || 'info'
  const formatTime = (value) => (value ? new Date(value).toLocaleString() : '-')
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
