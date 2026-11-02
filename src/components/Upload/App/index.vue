<template>
  <el-upload id="upload" ref="upload" :before-upload="beforeUpload" :http-request="onUpload" :show-file-list="false">
    <el-button v-loading="loading" type="success">上传</el-button>
    <el-progress v-if="progress > 0 && progress < 100" :percentage="progress" />&nbsp;
    <el-tag v-if="loading && progress === 100" type="warning">处理中</el-tag>
    <el-tag v-if="!loading && progress === 100" type="success">成功</el-tag>
  </el-upload>
</template>

<script setup>
  import { ElMessage } from 'element-plus'
  import { uploadApi } from '@/api/upload'
  import { ref } from 'vue'

  // 按扩展名校验，与后端安装包上传口径一致；浏览器给出的 MIME 不可靠（.ipa 常为空或 octet-stream）
  const allowedExtensions = ['.apk', '.ipa']
  const emit = defineEmits(['callback'])
  const progress = ref(0)
  const loading = ref(false)

  /**
   * 上传前校验
   * @param rawFile
   */
  const beforeUpload = (rawFile) => {
    const name = (rawFile.name || '').toLowerCase()
    if (!allowedExtensions.some((ext) => name.endsWith(ext))) {
      ElMessage.error('只支持上传 .apk 或 .ipa 安装包')
      return false
    }
    return true
  }

  /**
   * 上传
   * @param file
   */
  const onUpload = (file) => {
    loading.value = true
    progress.value = 0
    uploadApi
      .app(file.file, (p) => {
        progress.value = p
      })
      .then((res) => {
        loading.value = false
        emit('callback', res.docUrl)
      })
      .catch(() => {
        // 失败原因（413 文件过大、超时、业务错误）由请求层统一提示，这里只复位进度
        loading.value = false
        progress.value = 0
      })
  }
</script>

<style lang="scss" scoped>
  .el-button {
    margin-left: 12px;
  }
</style>
