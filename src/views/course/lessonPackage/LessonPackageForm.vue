<template>
  <el-dialog v-model="visible" :title="form.id ? '编辑课时包' : '新增课时包'" width="560px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="课程ID" prop="courseId">
        <el-input-number v-model="form.courseId" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="包名" prop="title">
        <el-input v-model="form.title" maxlength="100" />
      </el-form-item>
      <el-form-item label="课时数" prop="hourCount">
        <el-input-number v-model="form.hourCount" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="单课时长" prop="hourDuration">
        <el-input-number v-model="form.hourDuration" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="单价" prop="hourPrice">
        <el-input-number v-model="form.hourPrice" :min="0.01" :precision="2" controls-position="right" />
      </el-form-item>
      <el-form-item label="折扣" prop="discountRate">
        <el-input-number v-model="form.discountRate" :min="0.01" :max="1" :precision="2" controls-position="right" />
      </el-form-item>
      <el-form-item label="上课方式" prop="deliveryMode">
        <el-select v-model="form.deliveryMode">
          <el-option label="上门" value="onsite" />
          <el-option label="线上" value="online" />
          <el-option label="两种均可" value="both" />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="enabled" />
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="form.description" type="textarea" maxlength="500" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { courseApi } from '@/api/course'

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const saving = ref(false)
  const formRef = ref()
  const form = reactive({
    id: null,
    courseId: null,
    title: '',
    hourCount: 1,
    hourDuration: 60,
    hourPrice: 0,
    discountRate: 1,
    deliveryMode: 'both',
    statusId: 1,
    sort: 1,
    description: ''
  })

  const enabled = computed({
    get: () => form.statusId === 1,
    set: (value) => {
      form.statusId = value ? 1 : 0
    }
  })

  const rules = {
    courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
    title: [{ required: true, message: '请输入包名', trigger: 'blur' }],
    hourCount: [{ required: true, message: '请输入课时数', trigger: 'blur' }],
    hourDuration: [{ required: true, message: '请输入单课时长', trigger: 'blur' }],
    hourPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
    discountRate: [{ required: true, message: '请输入折扣', trigger: 'blur' }],
    deliveryMode: [{ required: true, message: '请选择上课方式', trigger: 'change' }]
  }

  const onOpen = (row) => {
    Object.assign(form, {
      id: row?.id || null,
      courseId: row?.courseId || null,
      title: row?.title || '',
      hourCount: row?.hourCount || 1,
      hourDuration: row?.hourDuration || 60,
      hourPrice: Number(row?.hourPrice || 0),
      discountRate: Number(row?.discountRate || 1),
      deliveryMode: row?.deliveryMode || 'both',
      statusId: row?.statusId ?? 1,
      sort: row?.sort || 1,
      description: row?.description || ''
    })
    visible.value = true
  }

  const submit = async () => {
    await formRef.value.validate()
    saving.value = true
    try {
      if (form.id) {
        await courseApi.lessonPackageEdit(form)
      } else {
        await courseApi.lessonPackageSave(form)
      }
      ElMessage.success('操作成功')
      visible.value = false
      emit('refresh')
    } finally {
      saving.value = false
    }
  }

  defineExpose({ onOpen })
</script>
