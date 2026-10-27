<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="科目">
            <el-input v-model="query.subject" placeholder="授课科目" clearable />
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="query.city" placeholder="城市" clearable />
          </el-form-item>
          <el-form-item label="资质">
            <el-select v-model="query.auditStatus" clearable style="width: 130px">
              <el-option label="审核中" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item label="上课方式">
            <el-select v-model="query.deliveryMode" clearable style="width: 130px">
              <el-option label="线上" value="online" />
              <el-option label="线下" value="offline" />
              <el-option label="均可" value="both" />
            </el-select>
          </el-form-item>
          <el-form-item label="展示">
            <el-select v-model="query.displayStatus" clearable style="width: 130px">
              <el-option label="展示中" value="visible" />
              <el-option label="已隐藏" value="hidden" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-select v-model="query.sort" clearable style="width: 130px">
              <el-option label="热度" value="hot" />
              <el-option label="评分" value="rating" />
              <el-option label="最新" value="newest" />
              <el-option label="价格" value="price" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="userId">
      <el-table-column label="讲师" min-width="220">
        <template #default="scope">
          <div class="teacher-cell">
            <el-avatar :size="40" :src="scope.row.avatar">{{ avatarText(scope.row.teacherName) }}</el-avatar>
            <div>
              <div>{{ scope.row.teacherName || '-' }}</div>
              <div class="table-secondary">UID: {{ scope.row.userId }} · {{ scope.row.city || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="授课科目" min-width="180" show-overflow-tooltip>
        <template #default="scope">{{ scope.row.subjects || '-' }}</template>
      </el-table-column>
      <el-table-column label="课程参考价" min-width="100">
        <template #default="scope">{{ money(scope.row.minHourPrice) }}</template>
      </el-table-column>
      <el-table-column label="教龄" min-width="90">
        <template #default="scope">{{ scope.row.teachingYears || 0 }} 年</template>
      </el-table-column>
      <el-table-column label="评分" min-width="90">
        <template #default="scope">{{ score(scope.row.rating) }}</template>
      </el-table-column>
      <el-table-column label="学生/课时" min-width="130">
        <template #default="scope">
          <div>{{ scope.row.studentCount || 0 }} 名</div>
          <div class="table-secondary">{{ scope.row.attendedHours || 0 }} 已上</div>
        </template>
      </el-table-column>
      <el-table-column label="方式" min-width="110">
        <template #default="scope">{{ deliveryLabel(scope.row.deliveryModes) }}</template>
      </el-table-column>
      <el-table-column label="运营" min-width="150">
        <template #default="scope">
          <div>权重 {{ scope.row.recommendWeight || 0 }}</div>
          <div class="table-secondary">热度 {{ scope.row.hotnessScore || 0 }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="150">
        <template #default="scope">
          <el-tag :type="auditType(scope.row.qualificationStatus)" effect="plain">{{ auditLabel(scope.row.qualificationStatus) }}</el-tag>
          <el-tag class="status-tag" :type="displayType(scope.row.displayStatus)" effect="plain">{{ displayLabel(scope.row.displayStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="210">
        <template #default="scope">
          <el-button v-permission="'user:tutor:list:edit'" text type="primary" @click="openConfig(scope.row)">编辑简介</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'user:tutor:list:edit'" text type="primary" @click="toggleDisplay(scope.row)">
            {{ scope.row.displayStatus === 'hidden' ? '启用展示' : '隐藏展示' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <el-dialog v-model="dialog.visible" title="讲师运营配置" width="640px" :destroy-on-close="true">
      <el-form :model="dialog.form" label-width="96px">
        <el-form-item label="授课科目">
          <el-input v-model="dialog.form.subjects" />
        </el-form-item>
        <el-form-item label="教龄">
          <el-input-number v-model="dialog.form.teachingYears" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="学历">
          <el-input v-model="dialog.form.degree" />
        </el-form-item>
        <el-form-item label="学校">
          <el-input v-model="dialog.form.school" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="dialog.form.bio" type="textarea" :rows="4" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="上课方式">
          <el-select v-model="dialog.form.deliveryModes" style="width: 180px">
            <el-option label="线上" value="online" />
            <el-option label="线下" value="offline" />
            <el-option label="均可" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐权重">
          <el-input-number v-model="dialog.form.recommendWeight" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item label="热度补分">
          <el-input-number v-model="dialog.form.hotnessScore" :min="0" :max="9999" controls-position="right" />
        </el-form-item>
        <el-form-item label="展示状态">
          <el-switch v-model="dialog.visibleSwitch" active-text="展示" inactive-text="隐藏" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="saveConfig()">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'

  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.tutorOperationPage
  })
  query.sort = 'hot'

  const dialog = reactive({
    visible: false,
    saving: false,
    visibleSwitch: true,
    form: {}
  })

  const openConfig = (row) => {
    dialog.form = {
      userId: row.userId,
      subjects: row.subjects || '',
      teachingYears: row.teachingYears || 0,
      degree: row.degree || '',
      school: row.school || '',
      bio: row.bio || '',
      deliveryModes: row.deliveryModes || 'both',
      recommendWeight: row.recommendWeight || 0,
      hotnessScore: row.hotnessScore || 0
    }
    dialog.visibleSwitch = row.displayStatus !== 'hidden'
    dialog.visible = true
  }

  const saveConfig = async () => {
    dialog.saving = true
    try {
      await usersApi.tutorOperationConfig({
        ...dialog.form,
        displayStatus: dialog.visibleSwitch ? 'visible' : 'hidden'
      })
      dialog.visible = false
      ElMessage.success('操作成功')
      await handlePage()
    } finally {
      dialog.saving = false
    }
  }

  const toggleDisplay = async (row) => {
    await usersApi.tutorOperationConfig({
      userId: row.userId,
      subjects: row.subjects || '',
      teachingYears: row.teachingYears || 0,
      degree: row.degree || '',
      school: row.school || '',
      bio: row.bio || '',
      deliveryModes: row.deliveryModes || 'both',
      recommendWeight: row.recommendWeight || 0,
      hotnessScore: row.hotnessScore || 0,
      displayStatus: row.displayStatus === 'hidden' ? 'visible' : 'hidden'
    })
    ElMessage.success('操作成功')
    handlePage()
  }

  const avatarText = (value) => (value ? value.slice(0, 1) : '讲')
  const auditLabel = (value) => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' })[value] || value || '-'
  const auditType = (value) => ({ pending: 'warning', approved: 'success', rejected: 'danger' })[value] || 'info'
  const displayLabel = (value) => ({ visible: '展示中', hidden: '已隐藏' })[value] || value || '-'
  const displayType = (value) => ({ visible: 'success', hidden: 'info' })[value] || 'info'
  const deliveryLabel = (value) => ({ online: '线上', offline: '线下', both: '均可' })[value] || value || '-'
  const score = (value) => (value ? Number(value).toFixed(1) : '-')
  const money = (value) => (value == null ? '-' : `¥${Number(value).toFixed(2)}`)
</script>

<style scoped>
  .teacher-cell {
    align-items: center;
    display: flex;
    gap: 10px;
  }

  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .status-tag {
    margin-left: 6px;
  }
</style>
