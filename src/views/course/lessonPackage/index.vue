<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="课程ID">
            <el-input v-model="query.courseId" clearable />
          </el-form-item>
          <el-form-item label="上课方式">
            <el-select v-model="query.deliveryMode" clearable style="width: 140px">
              <el-option label="上门" value="onsite" />
              <el-option label="线上" value="online" />
              <el-option label="两种均可" value="both" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.statusId" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
            <el-button v-permission="'course:lessonPackage:save'" type="primary" @click="openForm()">新增</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="课时包" min-width="220">
        <template #default="scope">
          <div>{{ scope.row.title }}</div>
          <div class="table-secondary">课程ID: {{ scope.row.courseId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="规格" min-width="180">
        <template #default="scope">
          <div>{{ scope.row.hourCount }} 课时 × {{ scope.row.hourDuration }} 分钟</div>
          <div class="table-secondary">{{ deliveryModeLabel(scope.row.deliveryMode) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="价格" min-width="180">
        <template #default="scope">
          <div>单价: {{ formatAmount(scope.row.hourPrice) }}</div>
          <div class="table-secondary">总价: {{ formatAmount(scope.row.totalPrice) }}</div>
          <div class="table-secondary">折扣: {{ scope.row.discountRate }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="90">
        <template #default="scope">
          <el-tag :type="scope.row.statusId === 1 ? 'success' : 'info'" effect="plain">{{ scope.row.statusId === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="90" />
      <el-table-column fixed="right" label="操作" min-width="180">
        <template #default="scope">
          <el-button v-permission="'course:lessonPackage:edit'" text type="primary" @click="openForm(scope.row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'course:lessonPackage:delete'" text type="danger" @click="handleDelete(scope.row, '确认禁用当前课时包?')">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <lesson-package-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { courseApi } from '@/api/course'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import LessonPackageForm from './LessonPackageForm.vue'

  const formRef = ref()
  const { page, handlePage, query, handleQuery, resetQuery, handleDelete } = useTable({
    page: courseApi.lessonPackagePage,
    delete: courseApi.lessonPackageDelete
  })

  const openForm = (row = null) => {
    formRef.value.onOpen(row)
  }

  const formatAmount = (value) => Number(value || 0).toFixed(2)
  const deliveryModeLabel = (value) => ({ onsite: '上门', online: '线上', both: '两种均可' })[value] || value || '-'
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
