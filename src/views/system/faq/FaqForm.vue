<template>
  <el-dialog :model-value="visible" :title="formModel.id ? '编辑FAQ' : '新增FAQ'" width="720px" destroy-on-close @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="90px" @submit.prevent>
      <el-form-item label="分类" prop="category">
        <el-select v-model="formModel.category" filterable style="width: 100%">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="问题" prop="question">
        <el-input v-model="formModel.question" maxlength="200" show-word-limit />
      </el-form-item>
      <el-form-item label="答案" prop="answer">
        <el-input v-model="formModel.answer" maxlength="2000" show-word-limit type="textarea" :rows="6" />
      </el-form-item>
      <el-form-item label="热门" prop="hot">
        <el-switch v-model="formModel.hot" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="状态" prop="statusId">
        <enum-radio v-model="formModel.statusId" :enum-name="'StatusIdEnum'" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formModel.sort" :min="0" controls-position="right" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose()">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit()">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { systemApi } from '@/api/system'
  import EnumRadio from '@/components/Enum/Radio/index.vue'

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const loading = ref(false)
  const formRef = ref()

  const categoryOptions = [
    { label: '账号', value: 'ACCOUNT' },
    { label: '约课', value: 'BOOKING' },
    { label: '支付', value: 'PAYMENT' },
    { label: '老师', value: 'TEACHER' },
    { label: '学生', value: 'STUDENT' },
    { label: '其他', value: 'OTHER' }
  ]

  const formDefault = {
    id: undefined,
    statusId: 1,
    sort: 1,
    category: 'OTHER',
    question: '',
    answer: '',
    hot: 0
  }
  const formModel = reactive({ ...formDefault })

  const rules = {
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
    answer: [{ required: true, message: '请输入答案', trigger: 'blur' }]
  }

  const onOpen = async (item) => {
    Object.assign(formModel, formDefault)
    if (item?.id) {
      const res = await systemApi.faqView({ id: item.id })
      Object.assign(formModel, { ...formDefault, ...res })
    }
    visible.value = true
  }

  const onClose = () => {
    Object.assign(formModel, formDefault)
    visible.value = false
  }

  const onSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    loading.value = true
    try {
      if (formModel.id) {
        await systemApi.faqEdit({ ...formModel })
        ElMessage.success('已更新FAQ')
      } else {
        await systemApi.faqSave({ ...formModel })
        ElMessage.success('已新增FAQ')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  defineExpose({ onOpen })
</script>
