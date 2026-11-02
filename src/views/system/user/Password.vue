<template>
  <el-dialog :append-to-body="true" :model-value="visible" title="密码重置" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px">
      <el-form-item label="登录密码" prop="mobilePwd">
        <el-input v-model="formModel.mobilePwd" class="form-group" type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="formModel.confirmPassword" class="form-group" type="password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button type="primary" @click="onSubmit()">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { systemApi } from '@/api/system'
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { encrypt, ENCRYPT_KEY_MISSING_MESSAGE } from '@/utils/base.js'

  // 校验规则
  const formRef = ref()
  const rules = {
    mobilePwd: [{ required: true, message: '不能为空', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '不能为空', trigger: 'blur' },
      { validator: (_rule, value, callback) => callback(value === formModel.mobilePwd ? undefined : new Error('两次输入的密码不一致')), trigger: 'blur' }
    ]
  }

  // 表单
  const loading = ref(false) // 加载进度状态
  const emit = defineEmits(['refresh'])
  const formDefault = {
    userId: undefined,
    mobilePwd: undefined,
    confirmPassword: undefined
  }
  const formModel = reactive({ ...formDefault })

  const onSubmit = async () => {
    // 校验
    const valid = await formRef.value.validate()
    if (!valid) return

    if (loading.value === true) {
      ElMessage.warning('正在处理···')
      return
    }
    loading.value = true
    try {
      if (formModel.userId) {
        // 单独构造请求体，失败后表单仍保留原输入，可直接重试
        const payload = { userId: formModel.userId, mobilePwdEncrypt: encrypt(formModel.mobilePwd) }
        const res = await systemApi.sysUserPassword(payload)
        ElMessage.success(res || '密码已重置')
        emit('refresh')
        onClose()
      }
    } catch (error) {
      if (error?.message === ENCRYPT_KEY_MISSING_MESSAGE) {
        ElMessage.error(ENCRYPT_KEY_MISSING_MESSAGE)
      }
    } finally {
      loading.value = false
    }
  }

  // 打开和关闭
  const visible = ref(false) // 弹窗显示状态
  const onOpen = (item) => {
    if (item) {
      formModel.userId = item.id
    }
    visible.value = true
  }
  defineExpose({ onOpen })
  const onClose = () => {
    visible.value = false
    Object.assign(formModel, formDefault)
  }
</script>
