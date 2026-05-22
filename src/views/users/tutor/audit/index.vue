<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="用户ID">
            <el-input-number v-model="query.userId" :min="1" controls-position="right" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.auditStatus" clearable style="width: 140px">
              <el-option label="审核中" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
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
      <el-table-column label="讲师" min-width="180">
        <template #default="scope">
          <div>UID: {{ scope.row.userId }}</div>
          <div class="table-secondary">{{ scope.row.subjects || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="资质" min-width="200">
        <template #default="scope">
          <div>{{ scope.row.degree || '-' }}</div>
          <div class="table-secondary">{{ scope.row.school || '-' }}</div>
          <div class="table-secondary">{{ scope.row.teachingYears || 0 }} 年教龄</div>
        </template>
      </el-table-column>
      <el-table-column label="上课方式" min-width="120" prop="deliveryModes" />
      <el-table-column label="状态" min-width="120">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.auditStatus)" effect="plain">{{ statusLabel(scope.row.auditStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核说明" min-width="220" show-overflow-tooltip>
        <template #default="scope">{{ scope.row.auditMessage || '-' }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="240">
        <template #default="scope">
          <el-button text type="primary" @click="previewRef.onOpen(scope.row)">查看</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'user:tutor:audit:approve'" text type="primary" @click="auditRef.onOpen('approve', scope.row)">通过</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'user:tutor:audit:reject'" text type="danger" @click="auditRef.onOpen('reject', scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <qualification-preview ref="previewRef" />
    <audit-dialog ref="auditRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import QualificationPreview from './QualificationPreview.vue'
  import AuditDialog from './AuditDialog.vue'

  const previewRef = ref()
  const auditRef = ref()
  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.tutorQualificationPage
  })

  const statusLabel = (value) => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' })[value] || value || '-'
  const statusType = (value) => ({ pending: 'warning', approved: 'success', rejected: 'danger' })[value] || 'info'
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }
</style>
