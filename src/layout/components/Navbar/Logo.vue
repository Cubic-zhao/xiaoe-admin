<template>
  <div class="logo">
    <span class="logo-mark" aria-hidden="true">鹅</span>
  </div>
</template>
<script setup></script>

<style lang="scss" scoped>
  // 与主菜单列同宽、同色，盖住顶栏底边线，让深色列上下连续
  .logo {
    flex: none;
    align-self: flex-start;
    display: grid;
    place-items: center;
    width: var(--xe-menu-main-width);
    height: var(--xe-header-height);
    background-color: var(--xe-ink-900);
  }

  .logo-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background-color: var(--xe-brand-600);
    color: #fff;
    font-size: 18px;
    font-weight: 700;
  }
</style>
