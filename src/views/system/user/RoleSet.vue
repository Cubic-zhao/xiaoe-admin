<template>
  <el-dialog
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="visible"
    :title="dialogTitle"
    width="860px"
    center
    align-center
    @close="onClose"
  >
    <div class="page_head" style="text-align: left">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="角色名称">
            <el-input v-model="query.roleName" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
            <el-button @click="clearAllRoles">全部清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table ref="tableRef" v-loading="page.loading" :data="page.list" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :width="50" />
      <el-table-column label="角色名称" prop="roleName" />
      <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      <el-table-column label="已选" width="100">
        <template #default="scope">
          <el-tag v-if="selectedRoleIds.includes(scope.row.id)" type="success" effect="plain">是</el-tag>
          <span v-else class="table-secondary">否</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-info">已选 {{ selectedRoleIds.length }} 个角色</span>
        <span class="handle_bar">
          <el-button @click="onClose">取消</el-button>
          <el-button :loading="saving" type="primary" @click="onSubmit">确定</el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { systemApi } from '@/api/system'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'

  const emit = defineEmits(['refresh', 'close'])

  const tableRef = ref()
  const visible = ref(false)
  const saving = ref(false)
  const userId = ref()
  const userLabel = ref('')
  const selectedRoleIds = ref([])

  const dialogTitle = computed(() => (userLabel.value ? `分配角色 - ${userLabel.value}` : '分配角色'))

  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: systemApi.sysRolePage
  })

  const normalizeIds = (ids) => {
    return Array.from(
      new Set(
        ids
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      )
    )
  }

  const syncSelection = async () => {
    if (!visible.value || !tableRef.value) {
      return
    }
    await nextTick()
    tableRef.value.clearSelection()
    page.list.forEach((item) => {
      if (selectedRoleIds.value.includes(item.id)) {
        tableRef.value.toggleRowSelection(item, true)
      }
    })
  }

  watch(
    () => page.list,
    async () => {
      await syncSelection()
    }
  )

  const handleSelectionChange = (selection) => {
    const pageIds = page.list.map((item) => item.id)
    const reservedIds = selectedRoleIds.value.filter((id) => !pageIds.includes(id))
    const currentSelectionIds = selection.map((item) => item.id)
    selectedRoleIds.value = normalizeIds(reservedIds.concat(currentSelectionIds))
  }

  const clearAllRoles = () => {
    selectedRoleIds.value = []
    tableRef.value?.clearSelection()
    ElMessage.success('已清空角色选择')
  }

  const onSubmit = async () => {
    if (!userId.value || saving.value) {
      return
    }

    saving.value = true
    try {
      await systemApi.sysRoleUserSave({
        userId: userId.value,
        roleIdList: selectedRoleIds.value
      })
      ElMessage.success('用户角色已更新')
      emit('refresh')
      onClose()
    } finally {
      saving.value = false
    }
  }

  const onOpen = async (item) => {
    userId.value = item?.id
    userLabel.value = item?.realName || item?.mobile || String(item?.id || '')
    visible.value = true
    selectedRoleIds.value = normalizeIds(await systemApi.sysRoleUserList({ userId: userId.value }))
    page.pageCurrent = 1
    if (page.pageSize < 100) {
      page.pageSize = 100
    }
    await handlePage()
    await syncSelection()
  }

  const onClose = () => {
    visible.value = false
    saving.value = false
    selectedRoleIds.value = []
    userId.value = undefined
    userLabel.value = ''
    tableRef.value?.clearSelection()
    emit('close')
  }

  defineExpose({ onOpen })
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .footer-info {
    color: #909399;
    font-size: 12px;
  }

  .table-secondary {
    color: #909399;
    font-size: 12px;
  }
</style>
