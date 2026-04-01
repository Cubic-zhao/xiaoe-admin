<template>
  <el-dialog
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="visible"
    :title="dialogTitle"
    width="760px"
    center
    align-center
    @close="onClose"
  >
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form inline label-width="80px">
          <el-form-item label="Keyword">
            <el-input v-model="filterKeyword" clearable placeholder="Menu name / path / permission" />
          </el-form-item>
          <el-form-item>
            <el-button @click="selectAndroidOps">Select Android Ops</el-button>
            <el-button @click="clearSelection">Clear All</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div v-loading="loading" class="tree-wrapper">
      <el-empty v-if="!loading && !treeList.length" description="No menu data" />
      <el-tree
        v-else
        ref="treeRef"
        :data="treeList"
        :default-expand-all="true"
        :filter-node-method="filterNode"
        :props="defaultProps"
        empty-text="No menu data"
        highlight-current
        node-key="id"
        show-checkbox
      >
        <template #default="{ data }">
          <div class="tree-node">
            <span class="tree-node__title">{{ data.menuName }}</span>
            <span class="tree-node__meta">{{ nodeMeta(data) }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-info">Selected {{ checkedCount }} menu nodes</span>
        <el-button @click="onClose">Cancel</el-button>
        <el-button :loading="saving" type="primary" @click="onSubmit">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { systemApi } from '@/api/system'

  const emit = defineEmits(['refresh', 'close'])

  const treeRef = ref()
  const visible = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const treeList = ref([])
  const roleId = ref()
  const roleName = ref('')
  const filterKeyword = ref('')

  const androidPresetPermissions = [
    'msg:page',
    'msg:save',
    'msg:edit',
    'msg:delete',
    'wallet:withdraw:audit:page',
    'wallet:withdraw:audit:pass',
    'wallet:withdraw:audit:reject',
    'wallet:withdraw:audit:remark'
  ]

  const defaultProps = {
    label: 'menuName',
    children: 'childrenList'
  }

  const dialogTitle = computed(() => (roleName.value ? `Assign Menus - ${roleName.value}` : 'Assign Menus'))
  const checkedCount = computed(() => {
    if (!treeRef.value) {
      return 0
    }
    return treeRef.value.getCheckedKeys().length + treeRef.value.getHalfCheckedKeys().length
  })

  watch(filterKeyword, (value) => {
    treeRef.value?.filter(value)
  })

  const filterNode = (value, data) => {
    if (!value) return true
    const keyword = String(value).trim().toLowerCase()
    return [data.menuName, data.path, data.permission, data.apis].some((item) => String(item || '').toLowerCase().includes(keyword))
  }

  const nodeMeta = (data) => {
    return data.permission || data.path || data.component || '-'
  }

  const normalizeKeys = (keys) => {
    return Array.from(
      new Set(
        keys
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      )
    )
  }

  const collectAndroidPresetIds = (list, bucket = []) => {
    list.forEach((item) => {
      if (androidPresetPermissions.includes(item.permission)) {
        bucket.push(item.id)
      }
      if (Array.isArray(item.childrenList) && item.childrenList.length) {
        collectAndroidPresetIds(item.childrenList, bucket)
      }
    })
    return bucket
  }

  const clearSelection = () => {
    treeRef.value?.setCheckedKeys([])
  }

  const selectAndroidOps = () => {
    if (!treeRef.value) {
      return
    }
    const current = normalizeKeys(treeRef.value.getCheckedKeys().concat(treeRef.value.getHalfCheckedKeys()))
    const presetIds = collectAndroidPresetIds(treeList.value)
    treeRef.value.setCheckedKeys(normalizeKeys(current.concat(presetIds)))
    ElMessage.success('Android-first menu presets selected')
  }

  const onSubmit = async () => {
    if (!treeRef.value || !roleId.value) {
      return
    }
    if (saving.value) {
      return
    }

    saving.value = true
    try {
      const menuIdList = normalizeKeys(treeRef.value.getCheckedKeys().concat(treeRef.value.getHalfCheckedKeys()))
      await systemApi.sysMenuRoleSave({ roleId: roleId.value, menuIdList })
      ElMessage.success('Role menus updated')
      emit('refresh')
      onClose()
    } finally {
      saving.value = false
    }
  }

  const onOpen = async (item) => {
    roleId.value = item?.id
    roleName.value = item?.roleName || ''
    filterKeyword.value = ''
    visible.value = true
    loading.value = true

    try {
      const [menus, checkedIds] = await Promise.all([systemApi.sysMenuList(), systemApi.sysMenuRoleList({ roleId: roleId.value })])
      treeList.value = Array.isArray(menus) ? menus : []
      await nextTick()
      treeRef.value?.setCheckedKeys(normalizeKeys(Array.isArray(checkedIds) ? checkedIds : []))
    } finally {
      loading.value = false
    }
  }

  const onClose = () => {
    visible.value = false
    loading.value = false
    saving.value = false
    filterKeyword.value = ''
    treeList.value = []
    roleId.value = undefined
    roleName.value = ''
    emit('close')
  }

  defineExpose({ onOpen })
</script>

<style scoped>
  .tree-wrapper {
    min-height: 320px;
    max-height: 60vh;
    overflow: auto;
    padding-right: 4px;
  }

  .tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding-right: 16px;
  }

  .tree-node__title {
    color: #303133;
  }

  .tree-node__meta {
    color: #909399;
    font-size: 12px;
    text-align: right;
  }

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
</style>
