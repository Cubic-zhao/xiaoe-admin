<template>
  <el-aside :class="{ 'show-sub': hasSubMenu }" @mouseleave="restoreSubMenu">
    <div class="menu-side">
      <div class="menu-main">
        <el-menu v-for="item in menuList" :key="item.id" :default-active="showMenuId" mode="vertical">
          <div class="menu-main-item" :class="[hoverMenuId === item.id ? 'hover' : '']" @mouseenter="showSubMenu(item.children, item)">
            <router-link :to="resolveMenuPath(item)" @click="handleMenu(item)">
              <el-menu-item :key="item.id" :class="[item.id === showMenuId ? 'is-active' : '']" :index="resolveMenuPath(item)">
                <icon :name="item.menuIcon" class="menu-icon" />
                {{ item.menuName }}
              </el-menu-item>
            </router-link>
          </div>
        </el-menu>
      </div>
      <div v-if="hasSubMenu" class="menu-sub">
        <el-menu v-for="sub in subMenuList" :key="sub.id" :default-active="showSubMenuId" mode="vertical">
          <div class="menu-sub-item">
            <router-link :to="resolveMenuPath(sub)" @click="showChildrenMenu(subMenuList)">
              <el-menu-item :key="sub.id" :class="[sub.id === showSubMenuId ? 'is-active' : '']" :index="resolveMenuPath(sub)">
                {{ sub.menuName }}
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
  .el-aside {
    overflow: hidden;
    width: 100px;

    &.show-sub {
      width: 200px;
    }

    transition: all 0.5s;
  }

  .menu-side {
    position: fixed;
    top: 60px;
  }

  .menu-main {
    .menu-icon {
      margin-right: 6px;
      width: 20px;
      height: 20px;
    }
    .el-menu {
      background-color: #15213e;
      border: 0;
    }

    width: 90px;
    float: left;
    height: calc(100vh - 50px);
    background-color: #15213e;
    padding-left: 10px;

    .menu-main-item {
      .el-menu-item {
        width: 90px;
        height: 50px;
        margin: 10px 0;
        color: white;
        border-radius: 10px 0 0 10px;

        &:hover {
          background-color: #3b455d;
          color: #fff;
        }

        &.is-active {
          background-color: #fff;
          color: black;
        }
      }

      .is-active {
        background-color: #fff;
        color: black;
      }
    }

    .hover {
      background-color: #3b455d;
      color: #fff;
      border-radius: 10px 0 0 10px;
    }
  }

  .menu-sub {
    width: 0;
    opacity: 0;
    float: left;
    padding-top: 10px;
    background-color: #fff;
    height: calc(100vh - 50px);
    transition: all 0.5s;

    .el-menu {
      border: none;
    }

    .menu-sub-item {
      .el-menu-item {
        height: 40px;
        box-sizing: border-box;
        margin: 5px auto;
        justify-content: center;
        width: 80px;

        &:hover {
          background-color: #f0f1ff;
          border-radius: 5px;
          width: 80px;
        }
      }

      .is-active {
        background-color: #f0f1ff;
        border-radius: 5px;
        width: 80px;
      }
    }
  }

  .show-sub {
    .menu-sub {
      transition: all 0.5s;
      width: 100px;
      opacity: 1;
    }
  }

  .is-active {
    color: black;
  }
</style>
