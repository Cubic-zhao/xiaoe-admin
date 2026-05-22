<template>
  <el-drawer v-model="visible" title="资质详情" size="520px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
      <el-descriptions-item label="审核状态">{{ statusLabel(detail.auditStatus) }}</el-descriptions-item>
      <el-descriptions-item label="教学科目">{{ detail.subjects || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学历">{{ detail.degree || '-' }}</el-descriptions-item>
      <el-descriptions-item label="学校">{{ detail.school || '-' }}</el-descriptions-item>
      <el-descriptions-item label="教龄">{{ detail.teachingYears || 0 }} 年</el-descriptions-item>
      <el-descriptions-item label="简介">{{ detail.bio || '-' }}</el-descriptions-item>
      <el-descriptions-item label="审核说明">{{ detail.auditMessage || '-' }}</el-descriptions-item>
    </el-descriptions>
    <el-divider />
    <el-table :data="detail.items || []" row-key="id">
      <el-table-column label="类型" prop="type" min-width="160" />
      <el-table-column label="状态" min-width="100">
        <template #default="scope">
          <el-tag effect="plain">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.imageUrl || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-drawer>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { usersApi } from '@/api/users'

  const visible = ref(false)
  const detail = reactive({ items: [] })

  const onOpen = async (row) => {
    const res = await usersApi.tutorQualificationView({ id: row.userId })
    Object.assign(detail, res || {})
    visible.value = true
  }

  const statusLabel = (value) => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' })[value] || value || '-'

  defineExpose({ onOpen })
</script>
