<template>
  <section class="panel" aria-labelledby="quick-links-title">
    <div class="panel-head">
      <h2 id="quick-links-title">快捷入口</h2>
    </div>
    <ul v-if="links.length" class="quick">
      <li v-for="item in links" :key="item.path">
        <router-link :to="item.path">
          <span class="quick-icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="quick-copy">
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </span>
          <el-icon class="quick-chev" aria-hidden="true"><arrow-right /></el-icon>
        </router-link>
      </li>
    </ul>
    <p v-else class="quick-empty">当前账号没有这些页面的访问权限，可通过左侧菜单进入已授权的页面。</p>
  </section>
</template>

<script setup>
  import { computed } from 'vue'
  import { ArrowRight } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/modules/user'

  // 家教运营常用页面；路径与 docs/sql 中 sys_menu 种子一致。
  // 只显示当前账号路由表里存在的页面，标题优先用后端菜单名。
  const ENTRIES = [
    { path: '/users/tutor/audit', icon: '审', title: '资质审核', desc: '老师入驻资料与资质' },
    { path: '/users/booking', icon: '约', title: '约课订单', desc: '学员约课与取消' },
    { path: '/users/schedule', icon: '排', title: '排课管理', desc: '调整时间与查看课表' },
    { path: '/users/lesson-record', icon: '记', title: '上课记录', desc: '课堂笔记与作业' },
    { path: '/users/feedback', icon: '馈', title: '反馈工单', desc: '处理学员与老师反馈' },
    { path: '/users/withdraw', icon: '提', title: '提现审核', desc: '老师提现申请' }
  ]

  const normalizePath = (path) => (path ? `/${String(path)}`.replace(/\/+/g, '/') : '')

  const links = computed(() => {
    const menus = new Map((useUserStore().getRouterList || []).map((menu) => [normalizePath(menu?.path), menu]))
    return ENTRIES.filter((entry) => menus.has(entry.path)).map((entry) => ({ ...entry, title: menus.get(entry.path)?.menuName || entry.title }))
  })
</script>

<style lang="scss" scoped>
  .panel {
    min-width: 0;
    padding: 20px 24px;
    background: #fff;
    border: 1px solid var(--xe-ink-200);
    border-radius: var(--xe-radius-md);
  }

  .panel-head h2 {
    margin: 0;
    color: var(--xe-ink-900);
    font-size: 15px;
    font-weight: 700;
  }

  .quick {
    margin: 8px 0 0;
    padding: 0;
    list-style: none;

    a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px;
      border-radius: 8px;

      &:hover {
        background: var(--xe-ink-100);
      }
    }
  }

  .quick-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--xe-brand-50);
    color: var(--xe-brand-600);
    font-weight: 800;
  }

  .quick-copy {
    min-width: 0;

    strong {
      display: block;
      color: var(--xe-ink-900);
      font-size: 14px;
    }

    small {
      display: block;
      color: var(--xe-ink-500);
      font-size: 12px;
    }
  }

  .quick-chev {
    margin-left: auto;
    color: var(--xe-ink-400);
  }

  .quick-empty {
    margin: 12px 0 0;
    color: var(--xe-ink-600);
    font-size: 13px;
  }
</style>
