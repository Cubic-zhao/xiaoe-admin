<template>
  <el-form-item label="目标类型" prop="targetType">
    <el-select v-model="model.targetType" placeholder="请选择目标类型">
      <el-option :value="1" label="外链" />
      <el-option :value="2" label="课程" />
      <el-option :value="3" label="讲师" />
      <el-option :value="4" label="活动" />
    </el-select>
  </el-form-item>

  <el-form-item label="目标ID" prop="targetId">
    <el-input v-model="model.targetId" maxlength="64" show-word-limit placeholder="可选：课程/讲师/活动ID" />
  </el-form-item>

  <el-form-item label="动作" prop="action">
    <el-select v-model="model.action" placeholder="请选择动作">
      <el-option value="navigate" label="页面跳转" />
      <el-option value="webview" label="WebView" />
      <el-option value="none" label="无动作" />
    </el-select>
  </el-form-item>

  <el-form-item label="状态" prop="status">
    <el-radio-group v-model="model.status">
      <el-radio :label="1">启用</el-radio>
      <el-radio :label="0">停用</el-radio>
    </el-radio-group>
  </el-form-item>

  <el-form-item label="排序" prop="sort">
    <el-input-number v-model="model.sort" :min="1" :max="9999" />
  </el-form-item>
</template>

<script setup>
defineProps({
  model: {
    type: Object,
    required: true
  }
})
</script>
