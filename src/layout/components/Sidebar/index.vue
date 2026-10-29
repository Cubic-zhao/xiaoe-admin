<template>
  <el-aside :class="{ 'show-sub': hasSubMenu }" @mouseleave="restoreSubMenu">
    <div class="menu-side">
      <div class="menu-main">
        <el-menu v-for="item in menuList" :key="item.id" :default-active="showMenuId" mode="vertical">
          <div class="menu-main-item" :class="[hoverMenuId === item.id ? 'hover' : '']" @mouseenter="showSubMenu(item.children, item)">
            <router-link :to="resolveMenuPath(item)" @click="handleMenu(item)">
              <el-menu-item :key="item.id" :class="[item.id === showMenuId ? 'is-active' : '']" :index="resolveMenuPath(item)">
                <icon :name="item.menuIcon" class="menu-icon" />
                <span class="menu-label">{{ item.menuName }}</span>
              </el-menu-item>
            </router-link>
          </div>
        </el-menu>
      </div>
      <div v-if="hasSubMenu" class="menu-sub">
        <p v-if="subMenuTitle" class="menu-sub-title">{{ subMenuTitle }}</p>
        <el-menu v-for="sub in subMenuList" :key="sub.id" :default-active="showSubMenuId" mode="vertical">
          <div class="menu-sub-item">
            <router-link :to="resolveMenuPath(sub)" @click="showChildrenMenu(subMenuList)">
              <el-menu-item :key="sub.id" :class="[sub.id === showSubMenuId ? 'is-active' : '']" :index="resolveMenuPath(sub)">
                <span class="menu-sub-label">{{ sub.menuName }}</span>
              </el-menu-item>
            </router-link>
          </div>
        </el-menu>
      </div>
    </div>
  </el-aside>
</template>

<script setup>
  import { computed, onMounted, ref, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'

  const route = useRoute()
  const rawMenuList = computed(() => useUserStore().getMenuList)

  const showMenuList = ref([])
  const showMenuId = ref()
  const showSubMenuId = ref()
  const subMenuList = ref([])
  const hoverMenuId = ref()

  const isVisibleMenu = (menu) => {
    if (!menu) {
      return false
    }
    return menu.menuType !== 2 || menu.isShow !== false
  }

  const filterVisibleMenus = (menuList = []) => {
    if (!Array.isArray(menuList)) {
      return []
    }
    return menuList.filter(isVisibleMenu)
  }

  const menuList = computed(() => filterVisibleMenus(rawMenuList.value))
  const hasSubMenu = computed(() => subMenuList.value.length > 0)

  // 子菜单列的分组标题：取当前子菜单所属一级菜单的名称，只用于展示
  const subMenuTitle = computed(() => {
    const firstId = subMenuList.value[0]?.id
    if (firstId === undefined) {
      return ''
    }
    const owner = menuList.value.find((menu) => filterVisibleMenus(menu.children).some((child) => child.id === firstId))
    return owner?.menuName || ''
  })

  const resolveMenuPath = (menu) => {
    const visibleChildren = filterVisibleMenus(menu?.children)
    if (visibleChildren.length > 0) {
      return visibleChildren[0].path
    }
    return menu?.path || route.path
  }

  watchEffect(() => {
    showSubMenuId.value = route.name
    const mapList = useUserStore().getBreadcrumbMap.get(showSubMenuId.value)
    if (mapList && mapList.length > 0) {
      showMenuId.value = mapList[0].id
      if (mapList.length > 2) {
        showSubMenuId.value = mapList[1].id
      }
    } else {
      showMenuId.value = route.name
    }
  })

  onMounted(() => {
    const menu = menuList.value.find((item) => item.id === showMenuId.value)
    subMenuList.value = filterVisibleMenus(menu?.children)
    showMenuList.value = [...subMenuList.value]
  })

  function showSubMenu(menuChildren, menu) {
    subMenuList.value = filterVisibleMenus(menuChildren)
    hoverMenuId.value = menu.id
  }

  function restoreSubMenu() {
    subMenuList.value = [...showMenuList.value]
    hoverMenuId.value = ''
  }

  function showChildrenMenu(menuChildren) {
    showMenuList.value = filterVisibleMenus(menuChildren)
    hoverMenuId.value = showMenuId.value
  }

  function handleMenu(menu) {
    const visibleChildren = filterVisibleMenus(menu.children)
    showMenuList.value = visibleChildren
    subMenuList.value = [...visibleChildren]
    showMenuId.value = menu.id
    hoverMenuId.value = showMenuId.value
  }
</script>

<style lang="scss" scoped>
  // 两列结构与悬停展开逻辑不变；宽度、配色按 60 号方案 §4.2
  .el-aside {
    overflow: hidden;
    width: var(--xe-menu-main-width);
    transition: all 0.5s;

    &.show-sub {
      width: calc(var(--xe-menu-main-width) + var(--xe-menu-sub-width));
    }
  }

  .menu-side {
    position: fixed;
    top: var(--xe-header-height);
    display: flex;
  }

  .menu-main {
    box-sizing: border-box;
    width: var(--xe-menu-main-width);
    height: calc(100vh - var(--xe-header-height));
    padding-top: 16px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--xe-ink-900);

    .el-menu {
      background-color: transparent;
      border: 0;
    }

    a {
      display: block;

      // 深色底上用实色内描边，保证焦点可见
      &:focus-visible {
        border-radius: 0;
        box-shadow: inset 0 0 0 2px var(--xe-brand-500);
      }
    }

    .menu-icon {
      width: 22px;
      height: 22px;
    }

    .menu-label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-main-item {
      .el-menu-item {
        position: relative;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        width: var(--xe-menu-main-width);
        height: 72px;
        padding: 0 6px;
        color: var(--xe-ink-400);
        font-size: 12px;
        line-height: 1.4;

        &:hover {
          background-color: var(--xe-ink-800);
          color: #fff;
        }

        &.is-active {
          background-color: var(--xe-ink-800);
          color: #fff;

          &::before {
            content: '';
            position: absolute;
            top: 14px;
            bottom: 14px;
            left: 0;
            width: 3px;
            border-radius: 0 3px 3px 0;
            background-color: var(--xe-brand-500);
          }
        }
      }

      &.hover .el-menu-item {
        background-color: var(--xe-ink-800);
        color: #fff;
      }
    }
  }

  .menu-sub {
    box-sizing: border-box;
    width: 0;
    height: calc(100vh - var(--xe-header-height));
    padding: 20px 12px;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 0;
    background-color: #fff;
    border-right: 1px solid var(--xe-ink-200);
    transition: all 0.5s;

    .el-menu {
      background-color: transparent;
      border: none;
    }

    .menu-sub-title {
      margin: 0 0 4px;
      padding: 0 8px;
      color: var(--xe-ink-500);
      font-size: 12px;
      font-weight: 600;
    }

    a {
      display: block;
      margin-top: 4px;
    }

    .menu-sub-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menu-sub-item {
      .el-menu-item {
        height: 40px;
        padding: 0 12px;
        border-radius: 8px;
        color: var(--xe-ink-700);
        font-size: 14px;
        line-height: 40px;

        &:hover {
          background-color: var(--xe-ink-100);
        }

        &.is-active {
          background-color: var(--xe-brand-50);
          color: var(--xe-brand-700);
          font-weight: 700;
        }
      }
    }
  }

  .show-sub {
    .menu-sub {
      width: var(--xe-menu-sub-width);
      opacity: 1;
    }
  }
</style>
