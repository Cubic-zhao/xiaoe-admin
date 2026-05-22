<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="学生ID">
            <el-input-number v-model="query.userId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="讲师ID">
            <el-input-number v-model="query.teacherId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="课程ID">
            <el-input-number v-model="query.courseId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" clearable style="width: 140px">
              <el-option v-for="item in relationStatuses" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="relationCourseId">
      <el-table-column label="学生/讲师" min-width="230">
        <template #default="scope">
          <div>{{ scope.row.studentName || '-' }} / UID: {{ scope.row.userId }}</div>
          <div class="table-secondary">{{ scope.row.teacherName || '-' }} / UID: {{ scope.row.teacherId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课程" min-width="220">
        <template #default="scope">
          <div>{{ scope.row.courseName || '-' }}</div>
          <div class="table-secondary">课程ID: {{ scope.row.courseId }} · 约课ID: {{ scope.row.bookingId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="课时" min-width="160">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress || 0" :stroke-width="8" />
          <div class="table-secondary">
            已上 {{ scope.row.attendedHours || 0 }} / 共 {{ scope.row.totalHours || 0 }}，剩余 {{ scope.row.remainingHours || 0 }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="下节课" min-width="180">
        <template #default="scope">{{ formatTime(scope.row.nextLessonAt) }}</template>
      </el-table-column>
      <el-table-column label="最近记录" min-width="180">
        <template #default="scope">
          <div>{{ formatTime(scope.row.lastRecordAt || scope.row.lastLessonAt) }}</div>
          <div class="table-secondary">评分: {{ scope.row.studentRating || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="110">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.status)" effect="plain">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="210">
        <template #default="scope">
          <el-button v-permission="'user:tutor:relation:view'" text type="primary" @click="openProgress(scope.row)">查看学情</el-button>
          <el-divider direction="vertical" />
          <el-button text type="primary" @click="goSchedule(scope.row)">排课</el-button>
          <el-divider direction="vertical" />
          <el-button text type="primary" @click="goRecord(scope.row)">记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <el-drawer :model-value="drawer.visible" title="学情明细" size="680px" :destroy-on-close="true" @close="closeDrawer">
      <el-table v-loading="drawer.loading" :data="drawer.items" row-key="relationCourseId">
        <el-table-column label="课程" min-width="220">
          <template #default="scope">
            <div>{{ scope.row.courseName || '-' }}</div>
            <div class="table-secondary">约课ID: {{ scope.row.bookingId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="进度" min-width="160">
          <template #default="scope">
            <el-progress :percentage="scope.row.progress || 0" :stroke-width="8" />
            <div class="table-secondary">{{ scope.row.attendedHours || 0 }} / {{ scope.row.totalHours || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="下节课" min-width="170">
          <template #default="scope">{{ formatTime(scope.row.nextLessonAt) }}</template>
        </el-table-column>
        <el-table-column label="最近记录" min-width="170">
          <template #default="scope">{{ formatTime(scope.row.lastRecordAt || scope.row.lastLessonAt) }}</template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'

  const router = useRouter()
  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.tutorRelationPage
  })
  const drawer = reactive({
    visible: false,
    loading: false,
    items: []
  })

  const relationStatuses = [
    { label: '进行中', value: 'active' },
    { label: '已完结', value: 'completed' },
    { label: '已取消', value: 'canceled' }
  ]

  const openProgress = async (row) => {
    drawer.visible = true
    drawer.loading = true
    drawer.items = await usersApi.tutorRelationProgress({ relationId: row.relationId })
    drawer.loading = false
  }
  const closeDrawer = () => {
    drawer.visible = false
    drawer.items = []
  }
  const goSchedule = (row) => {
    router.push({ path: '/users/schedule', query: { bookingId: row.bookingId } })
  }
  const goRecord = (row) => {
    router.push({ path: '/users/lesson-record', query: { bookingId: row.bookingId } })
  }
  const statusLabel = (value) => {
    const target = relationStatuses.find((item) => item.value === value)
    return target ? target.label : value || '-'
  }
  const statusType = (value) => ({ active: 'primary', completed: 'success', canceled: 'info' })[value] || 'info'
  const formatTime = (value) => (value ? new Date(value).toLocaleString() : '-')
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
