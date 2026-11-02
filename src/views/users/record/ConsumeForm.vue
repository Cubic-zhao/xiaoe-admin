<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="'余额变动'" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item class="form-group" label="消费类型" prop="consumeType">
        <enum-radio v-model="formModel.consumeType" :enum-name="'ConsumeTypeEnum'"></enum-radio>
      </el-form-item>
      <el-form-item class="form-group" label="金额大小" prop="consumeAmount">
        <el-input-number v-model="formModel.consumeAmount" :precision="2" :min="0.01" :step="1" />
      </el-form-item>
      <el-form-item class="form-group" label="备注" prop="remark">
        <el-input v-model="formModel.remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">取消</el-button>
        <el-button type="primary" @click="onSubmit()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { reactive, ref } from 'vue'
  import EnumRadio from '@/components/Enum/Radio/index.vue'
  import { usersApi } from '@/api/users.js'

  // 校验规则
  const formRef = ref()
  const rules = {
    consumeType: [{ required: true, message: '请选择消费类型', trigger: 'change' }],
    consumeAmount: [
      { required: true, message: '不能为空', trigger: 'blur' },
      { validator: (_rule, value, callback) => callback(Number(value) >= 0.01 ? undefined : new Error('金额不能小于 0.01')), trigger: 'blur' }
    ]
  }

  // 表单
  const loading = ref(false) // 加载进度状态
  const emit = defineEmits(['refresh'])
  const formDefault = {
    userId: undefined,
    consumeType: 2,
    consumeAmount: 0.01,
    remark: undefined
  }
  const formModel = reactive({ ...formDefault })
  const onSubmit = async () => {
    // 校验
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    if (loading.value === true) {
      ElMessage.warning('正在处理···')
      return
    }
    // 资金操作二次确认：写明用户、方向与金额（ConsumeTypeEnum：1 减少，2 增加）
    const direction = formModel.consumeType === 1 ? '减少' : '增加'
    const amount = Number(formModel.consumeAmount).toFixed(2)
    try {
      await ElMessageBox.confirm(`确认为用户（ID ${formModel.userId}）${direction}余额 ¥${amount}？提交后立即生效并记入余额流水。`, '余额变动确认', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: `确认${direction}`
      })
    } catch {
      return
    }
    loading.value = true
    try {
      await usersApi.usersAccountConsumeSave(formModel)
      ElMessage.success('余额已变动')
      emit('refresh')
      onClose()
    } catch {
      // 失败原因由请求层提示；余额可能已被其他操作改变（409），刷新列表展示最新余额
      emit('refresh')
    } finally {
      loading.value = false
    }
  }

  // 打开和关闭
  const visible = ref(false) // 弹窗显示状态
  const onOpen = (userId) => {
    formModel.userId = userId
    visible.value = true
  }
  defineExpose({ onOpen })
  const onClose = () => {
    visible.value = false
    Object.assign(formModel, formDefault)
  }
</script>
