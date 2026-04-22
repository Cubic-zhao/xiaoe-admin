<template>
  <el-dialog
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="visible"
    :title="dialogTitle"
    width="640px"
    center
    align-center
    @close="onClose"
  >
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="96px" @submit.prevent>
      <el-form-item v-if="isCreateMode" label="Preset">
        <div class="preset-row">
          <el-select v-model="presetKey" class="preset-select" clearable filterable placeholder="Select a preset">
            <el-option v-for="item in presetOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button :disabled="!presetKey" type="primary" plain @click="applyPreset">Apply</el-button>
        </div>
        <div class="tip-info">Use presets to reduce route, component, permission, and API mismatches for Android-first pages.</div>
      </el-form-item>

      <el-form-item label="Type" prop="menuType">
        <enum-radio v-model="formModel.menuType" :enum-name="'MenuTypeEnum'" />
      </el-form-item>

      <el-form-item label="Name" prop="menuName">
        <el-input v-model="formModel.menuName" class="form-group" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item v-if="formModel.menuType === 2" label="Path" prop="path">
        <el-input v-model="formModel.path" class="form-group" maxlength="50" placeholder="/users/withdraw" show-word-limit />
      </el-form-item>

      <el-form-item v-if="formModel.menuType === 2" label="Component" prop="component">
        <el-input v-model="formModel.component" class="form-group" maxlength="100" placeholder="/users/withdraw/index.vue" show-word-limit />
      </el-form-item>

      <el-form-item v-if="formModel.menuType !== 1" label="Permission" prop="permission">
        <el-input v-model="formModel.permission" class="form-group" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item v-if="formModel.menuType !== 1" label="APIs" prop="apis">
        <el-input
          v-model="formModel.apis"
          :rows="5"
          class="form-group"
          type="textarea"
          maxlength="1000"
          placeholder="/user/admin/wallet/withdraw/page&#10;/user/admin/wallet/withdraw/view"
          show-word-limit
        />
        <div class="tip-info">One API path per line is recommended so menu authorization is easier to verify.</div>
      </el-form-item>

      <el-form-item v-if="formModel.menuType === 2" label="Mode" prop="isShow">
        <el-switch v-model="formModel.isShow" inline-prompt active-text="Menu" inactive-text="Route" />
        <span class="tip-info">Menu mode is visible in navigation. Route mode stays hidden but still participates in routing.</span>
      </el-form-item>

      <el-form-item v-if="isRootMenu" label="Icon" prop="menuIcon">
        <icon :name="formModel.menuIcon" />
        <el-button link type="primary" @click="handleIcon">Select Icon</el-button>
        <selector-svg v-if="iconVisible" :visible="iconVisible" @update="handleUpdateIcon" @close="onCloseIcon" />
      </el-form-item>

      <el-form-item label="Sort" prop="sort">
        <el-input-number v-model="formModel.sort" :min="0" controls-position="right" />
      </el-form-item>

      <el-form-item label="Remark" prop="remark">
        <el-input v-model="formModel.remark" :rows="3" maxlength="255" show-word-limit type="textarea" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">Cancel</el-button>
        <el-button type="primary" @click="onSubmit">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { systemApi } from '@/api/system'
  import EnumRadio from '@/components/Enum/Radio/index.vue'
  import SelectorSvg from '@/components/Selector/Svg/index.vue'

  const emit = defineEmits(['refresh'])

  const presetOptions = [
    { label: '\u6d88\u606f\u63a8\u9001\u7ba1\u7406 - \u8def\u7531\u83dc\u5355', value: 'msg-page' },
    { label: '\u6d88\u606f\u63a8\u9001\u7ba1\u7406 - \u65b0\u589e\u6309\u94ae', value: 'msg-save' },
    { label: '\u6d88\u606f\u63a8\u9001\u7ba1\u7406 - \u7f16\u8f91\u6309\u94ae', value: 'msg-edit' },
    { label: '\u6d88\u606f\u63a8\u9001\u7ba1\u7406 - \u5220\u9664\u6309\u94ae', value: 'msg-delete' },
    { label: '\u63d0\u73b0\u5ba1\u6838 - \u8def\u7531\u83dc\u5355', value: 'withdraw-page' },
    { label: '\u63d0\u73b0\u5ba1\u6838 - \u901a\u8fc7\u6309\u94ae', value: 'withdraw-pass' },
    { label: '\u63d0\u73b0\u5ba1\u6838 - \u9a73\u56de\u6309\u94ae', value: 'withdraw-reject' },
    { label: '\u63d0\u73b0\u5ba1\u6838 - \u5ba1\u6838\u5907\u6ce8\u6743\u9650', value: 'withdraw-remark' }
  ]

  const presetMap = {
    'msg-page': {
      menuType: 2,
      menuName: '\u6d88\u606f\u63a8\u9001\u7ba1\u7406',
      path: '/users/msg',
      component: '/users/msg/index.vue',
      permission: 'msg:page',
      apis: ['/user/admin/msg/page', '/user/admin/msg/view', '/user/admin/msg/save', '/user/admin/msg/edit', '/user/admin/msg/delete'].join('\n'),
      isShow: true,
      remark: 'Android \u6d88\u606f\u4e2d\u5fc3\u540e\u53f0\u8fd0\u8425\u9875'
    },
    'msg-save': {
      menuType: 3,
      menuName: '\u6d88\u606f\u63a8\u9001-\u65b0\u589e',
      permission: 'msg:save',
      apis: '/user/admin/msg/save',
      remark: '\u6d88\u606f\u63a8\u9001\u65b0\u589e\u6743\u9650'
    },
    'msg-edit': {
      menuType: 3,
      menuName: '\u6d88\u606f\u63a8\u9001-\u7f16\u8f91',
      permission: 'msg:edit',
      apis: '/user/admin/msg/edit',
      remark: '\u6d88\u606f\u63a8\u9001\u7f16\u8f91\u4e0e\u4e0a\u4e0b\u7ebf\u6743\u9650'
    },
    'msg-delete': {
      menuType: 3,
      menuName: '\u6d88\u606f\u63a8\u9001-\u5220\u9664',
      permission: 'msg:delete',
      apis: '/user/admin/msg/delete',
      remark: '\u6d88\u606f\u63a8\u9001\u5220\u9664\u6743\u9650'
    },
    'withdraw-page': {
      menuType: 2,
      menuName: '\u63d0\u73b0\u5ba1\u6838',
      path: '/users/withdraw',
      component: '/users/withdraw/index.vue',
      permission: 'wallet:withdraw:audit:page',
      apis: [
        '/user/admin/wallet/withdraw/page',
        '/user/admin/wallet/withdraw/view',
        '/user/admin/wallet/withdraw/pass',
        '/user/admin/wallet/withdraw/reject'
      ].join('\n'),
      isShow: true,
      remark: 'Android \u94b1\u5305\u63d0\u73b0\u5ba1\u6838\u9875'
    },
    'withdraw-pass': {
      menuType: 3,
      menuName: '\u63d0\u73b0\u5ba1\u6838-\u901a\u8fc7',
      permission: 'wallet:withdraw:audit:pass',
      apis: '/user/admin/wallet/withdraw/pass',
      remark: '\u63d0\u73b0\u5ba1\u6838 pending -> processing -> success \u6743\u9650'
    },
    'withdraw-reject': {
      menuType: 3,
      menuName: '\u63d0\u73b0\u5ba1\u6838-\u9a73\u56de',
      permission: 'wallet:withdraw:audit:reject',
      apis: '/user/admin/wallet/withdraw/reject',
      remark: '\u63d0\u73b0\u5ba1\u6838\u9a73\u56de\u6743\u9650'
    },
    'withdraw-remark': {
      menuType: 3,
      menuName: '\u63d0\u73b0\u5ba1\u6838-\u5907\u6ce8',
      permission: 'wallet:withdraw:audit:remark',
      apis: '',
      remark: '\u63d0\u73b0\u5ba1\u6838\u901a\u8fc7\u65f6\u7684\u5ba1\u6838\u5907\u6ce8\u6743\u9650'
    }
  }

  const formRef = ref()
  const visible = ref(false)
  const loading = ref(false)
  const iconVisible = ref(false)
  const presetKey = ref('')

  const validateRoutePath = (_, value, callback) => {
    if (formModel.menuType !== 2) {
      callback()
      return
    }
    if (!String(value || '').trim()) {
      callback(new Error('Path is required for route menus'))
      return
    }
    callback()
  }

  const validateRouteComponent = (_, value, callback) => {
    if (formModel.menuType !== 2) {
      callback()
      return
    }
    if (!String(value || '').trim()) {
      callback(new Error('Component is required for route menus'))
      return
    }
    callback()
  }

  const validatePermission = (_, value, callback) => {
    if (formModel.menuType === 1) {
      callback()
      return
    }
    if (!String(value || '').trim()) {
      callback(new Error('Permission is required for non-directory menus'))
      return
    }
    callback()
  }

  const rules = {
    menuType: [{ required: true, message: 'Type is required', trigger: 'blur' }],
    menuName: [{ required: true, message: 'Name is required', trigger: 'blur' }],
    path: [{ validator: validateRoutePath, trigger: 'blur' }],
    component: [{ validator: validateRouteComponent, trigger: 'blur' }],
    permission: [{ validator: validatePermission, trigger: 'blur' }]
  }

  const formDefault = {
    id: undefined,
    parentId: '0',
    menuType: 1,
    menuName: undefined,
    menuIcon: undefined,
    path: undefined,
    component: undefined,
    permission: undefined,
    apis: undefined,
    isShow: true,
    sort: 1,
    remark: undefined
  }

  const formModel = reactive({ ...formDefault })

  const dialogTitle = computed(() => (formModel.id ? 'Edit Menu' : 'Add Menu'))
  const isCreateMode = computed(() => !formModel.id)
  const isRootMenu = computed(() => String(formModel.parentId ?? '0') === '0')

  const handleIcon = () => {
    iconVisible.value = true
  }

  const handleUpdateIcon = (icon) => {
    formModel.menuIcon = icon
    onCloseIcon()
  }

  const onCloseIcon = () => {
    iconVisible.value = false
  }

  const applyPreset = ({ silent = false } = {}) => {
    const preset = presetMap[presetKey.value]
    if (!preset) {
      return
    }
    const currentParentId = formModel.parentId ?? '0'
    const currentSort = formModel.sort ?? 1
    Object.assign(formModel, { ...formDefault, parentId: currentParentId, sort: currentSort }, preset)
    if (!silent) {
      ElMessage.success('Preset applied')
    }
  }

  const normalizeSingleLineText = (value) => {
    const normalized = String(value || '').trim()
    return normalized || undefined
  }

  const normalizeApis = (value) => {
    const normalized = String(value || '')
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (!normalized.length) {
      return undefined
    }

    return Array.from(new Set(normalized)).join('\n')
  }

  const buildPayload = () => {
    const payload = { ...formModel }

    payload.menuName = normalizeSingleLineText(payload.menuName)
    payload.path = normalizeSingleLineText(payload.path)
    payload.component = normalizeSingleLineText(payload.component)
    payload.permission = normalizeSingleLineText(payload.permission)
    payload.apis = normalizeApis(payload.apis)
    payload.remark = normalizeSingleLineText(payload.remark)

    if (payload.menuType !== 2) {
      payload.path = undefined
      payload.component = undefined
      payload.isShow = undefined
    }

    if (payload.menuType === 1) {
      payload.permission = undefined
      payload.apis = undefined
    }

    if (payload.menuType !== 1) {
      payload.menuIcon = undefined
    }
    return payload
  }

  const onSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (loading.value) {
      ElMessage.warning('Submitting...')
      return
    }

    loading.value = true
    try {
      const payload = buildPayload()
      if (formModel.id) {
        await systemApi.sysMenuEdit(payload)
        ElMessage.success('Updated successfully')
      } else {
        await systemApi.sysMenuSave(payload)
        ElMessage.success('Created successfully')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  const onOpen = (item, parentId, preset) => {
    Object.assign(formModel, formDefault)
    presetKey.value = ''

    if (item) {
      Object.assign(formModel, item)
    }
    if (parentId !== undefined && parentId !== null) {
      formModel.parentId = parentId
    }
    if (!item && preset) {
      presetKey.value = preset
      applyPreset({ silent: true })
    }

    visible.value = true
  }

  defineExpose({ onOpen })

  const onClose = () => {
    visible.value = false
    presetKey.value = ''
    Object.assign(formModel, formDefault)
  }
</script>

<style scoped>
  .preset-row {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .preset-select {
    flex: 1;
  }

  .tip-info {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
    margin-left: 12px;
  }
</style>
