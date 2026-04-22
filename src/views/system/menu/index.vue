<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.menuName" placeholder="Menu name" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">Search</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetQuery()">Refresh</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-if="canSaveMenu" type="primary" @click="openFormModal(null, '0')">Add Menu</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" :tree-props="{ children: 'childrenList', hasChildren: 'hasChildren' }" row-key="id">
      <el-table-column label="Name" min-width="180" prop="menuName">
        <template #default="scope">
          <span v-if="scope.row.menuIcon"><icon :name="scope.row.menuIcon" class="menu-icon" /></span>
          <span class="menu-name">{{ scope.row.menuName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Type" min-width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.menuType === 2 && !scope.row.isShow">Route</el-tag>
          <enum-view v-else :enum-name="'MenuTypeEnum'" :enum-value="scope.row.menuType" />
        </template>
      </el-table-column>

      <el-table-column label="Path / Component" min-width="240">
        <template #default="scope">
          <el-tag v-if="scope.row.path">{{ scope.row.path }}</el-tag>
          <div class="table-secondary">{{ scope.row.component || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Permission / APIs" min-width="260">
        <template #default="scope">
          <el-tag v-if="scope.row.permission">{{ scope.row.permission }}</el-tag>
          <div class="table-secondary table-pre">{{ scope.row.apis || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Sort" min-width="80" prop="sort" />

      <el-table-column label="Status" min-width="100">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="360" fixed="right">
        <template #default="scope">
          <el-button v-if="scope.row.menuType !== 3 && canSaveMenu" text type="primary" @click="openFormModal(null, scope.row.id)">
            Add Child
          </el-button>

          <el-divider v-if="scope.row.menuType !== 3 && canSaveMenu" direction="vertical" />

          <el-button v-if="canEditMenu" text type="primary" @click="openFormModal(scope.row)">Edit</el-button>

          <el-divider v-if="canSaveMenu && getPresetActions(scope.row).length" direction="vertical" />

          <el-dropdown v-if="canSaveMenu && getPresetActions(scope.row).length">
            <el-button text type="primary">
              Android Presets
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
              More
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="canEditMenu" @click="handleStatus(scope.row)">
                  <span>{{ scope.row.statusId === 0 ? 'Enable' : 'Disable' }}</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="canDeleteMenu" @click="handleDelete(scope.row)">
                  <span>Delete</span>
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
    { label: 'Message Page', value: 'msg-page' },
    { label: 'Withdraw Audit Page', value: 'withdraw-page' }
  ]

  const presetActionMap = {
    'msg:page': [
      { label: 'Message Save Button', value: 'msg-save' },
      { label: 'Message Edit Button', value: 'msg-edit' },
      { label: 'Message Delete Button', value: 'msg-delete' }
    ],
    'wallet:withdraw:audit:page': [
      { label: 'Withdraw Pass Button', value: 'withdraw-pass' },
      { label: 'Withdraw Reject Button', value: 'withdraw-reject' },
      { label: 'Withdraw Audit Note Permission', value: 'withdraw-remark' }
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
