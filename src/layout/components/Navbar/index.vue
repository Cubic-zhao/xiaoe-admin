<template>
  <el-header>
    <logo />
    <span class="product-name">小鹅家教 · 运营管理平台</span>
    <breadcrumb />
    <user />
  </el-header>
</template>
<script setup>
  import Logo from './Logo.vue'
  import Breadcrumb from './Breadcrumb.vue'
  import User from './User.vue'
</script>

<style lang="scss" scoped>
  .el-header {
    // Element Plus 在 .el-header 上自带 --el-header-height:60px，这里改为统一的 56px
    --el-header-height: var(--xe-header-height);
    position: fixed;
    display: flex;
    align-items: center;
    padding: 0;
    width: 100%;
    z-index: 99;
    background-color: #fff;
    border-bottom: 1px solid var(--el-border-color);
  }

  .product-name {
    flex: none;
    margin-left: 16px;
    color: var(--xe-ink-900);
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
  }
</style>
