<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.menuName" placeholder="菜单名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetQuery()">刷新</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-if="canSaveMenu" type="primary" @click="openFormModal(null, '0')">新增菜单</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" :tree-props="{ children: 'childrenList', hasChildren: 'hasChildren' }" row-key="id">
      <el-table-column label="名称" min-width="180" prop="menuName">
        <template #default="scope">
          <span v-if="scope.row.menuIcon"><icon :name="scope.row.menuIcon" class="menu-icon" /></span>
          <span class="menu-name">{{ scope.row.menuName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="类型" min-width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.menuType === 2 && !scope.row.isShow">隐藏路由</el-tag>
          <enum-view v-else :enum-name="'MenuTypeEnum'" :enum-value="scope.row.menuType" />
        </template>
      </el-table-column>

      <el-table-column label="路由 / 组件" min-width="240">
        <template #default="scope">
          <el-tag v-if="scope.row.path">{{ scope.row.path }}</el-tag>
          <div class="table-secondary">{{ scope.row.component || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="权限键 / 接口" min-width="260">
        <template #default="scope">
          <el-tag v-if="scope.row.permission">{{ scope.row.permission }}</el-tag>
          <div class="table-secondary table-pre">{{ scope.row.apis || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="排序" min-width="80" prop="sort" />

      <el-table-column label="状态" min-width="100">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="360" fixed="right">
        <template #default="scope">
          <el-button v-if="scope.row.menuType !== 3 && canSaveMenu" text type="primary" @click="openFormModal(null, scope.row.id)">
            新增下级
          </el-button>

          <el-divider v-if="scope.row.menuType !== 3 && canSaveMenu" direction="vertical" />

          <el-button v-if="canEditMenu" text type="primary" @click="openFormModal(scope.row)">编辑</el-button>

          <el-divider v-if="canSaveMenu && getPresetActions(scope.row).length" direction="vertical" />

          <el-dropdown v-if="canSaveMenu && getPresetActions(scope.row).length">
            <el-button text type="primary">
              常用预设
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in getPresetActions(scope.row)" :key="item.value" @click="openFormModal(null, scope.row.id, item.value)">
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-divider v-if="canManageMore" direction="vertical" />

          <el-dropdown v-if="canManageMore">
            <el-button text type="primary">
              更多
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="canEditMenu" @click="handleStatus(scope.row)">
                  <span>{{ scope.row.statusId === 0 ? '启用' : '禁用' }}</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="canDeleteMenu" @click="handleDelete(scope.row)">
                  <span>删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <menu-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import useTable from '@/utils/table'
  import MenuForm from './MenuForm.vue'
  import { systemApi } from '@/api/system'
  import EnumView from '@/components/Enum/View/index.vue'
  import { hasPermission } from '@/utils/permission.js'

  const basePresetActions = [
    { label: '消息推送管理页', value: 'msg-page' },
    { label: '提现审核页', value: 'withdraw-page' }
  ]

  const presetActionMap = {
    'msg:page': [
      { label: '消息新增按钮', value: 'msg-save' },
      { label: '消息编辑按钮', value: 'msg-edit' },
      { label: '消息删除按钮', value: 'msg-delete' }
    ],
    'wallet:withdraw:audit:page': [
      { label: '提现通过按钮', value: 'withdraw-pass' },
      { label: '提现驳回按钮', value: 'withdraw-reject' },
      { label: '提现审核备注权限', value: 'withdraw-remark' }
    ]
  }

  const formRef = ref()
  const canSaveMenu = hasPermission('sys:menu:save')
  const canEditMenu = hasPermission('sys:menu:edit')
  const canDeleteMenu = hasPermission('sys:menu:delete')
  const canManageMore = canEditMenu || canDeleteMenu
  const openFormModal = (item, parentId, preset) => {
    formRef.value.onOpen(item, parentId, preset)
  }

  const getPresetActions = (row) => {
    if (row.menuType === 3) {
      return []
    }

    if (presetActionMap[row.permission]) {
      return presetActionMap[row.permission]
    }

    return basePresetActions
  }

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: systemApi.sysMenuList,
    delete: systemApi.sysMenuDelete,
    status: systemApi.sysMenuEdit
  })
</script>

<style scoped>
  .menu-name {
    margin-left: 8px;
  }

  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .table-pre {
    white-space: pre-line;
  }
</style>
