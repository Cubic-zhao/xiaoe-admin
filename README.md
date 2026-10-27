# XiaoE Web Admin（运营后台）

> - 更新时间：2026-10-27（文档清理后重写）
> - 定位：家教 O2O 平台的运营后台，只调用后端 admin 面
> - 对应后端面：`/system/admin/**`、`/user/admin/**`、`/course/admin/**`
> - 仓库路径：`D:/MyProject/Program/XiaoE/Xiaoe-education-release/xiaoe-education-admin`
> - 实施标准：[50_Admin端按Preview39屏家教O2O运营闭环开发方案.md](./50_Admin端按Preview39屏家教O2O运营闭环开发方案.md)

## 1. 职责

1. 系统：后台账号、角色、菜单、配置、日志、FAQ、App 版本。
2. 内容：首页轮播、快捷入口（导航）、友情链接、专区。
3. 课程：分类、课程、章节课时、资源、课时包、学习 / 订单记录。
4. 家教运营：讲师资质审核、讲师运营、师生关系、约课订单、排课、上课记录、反馈工单、消息、提现审核。

后台操作必须改变后端真实状态，并能在 Android / 官网对应页面看到结果（50 号 §7）。

## 2. 技术栈

Vue 3.4.21 / Vite 5.2 / Pinia 2.1.7 / Vue Router 4.3（hash 模式）/ Element Plus 2.6.3 / Axios 1.7.4 /
`jsencrypt`（登录 RSA）/ ECharts 5.5 / WangEditor 5 / `vite-plugin-svg-icons`。

## 3. 运行链

1. `src/main.js` 启动；cookie（`EDU_OS_ADMIN_TOKEN`）有 token 时先调用 `loginApi.getUserInfo()`。
2. `createNewRouter(routerList)` 把后端菜单装配成动态路由：菜单 `component` 解析为 `src/views/**.vue`，找不到时显示 404 页。
3. 请求统一走 `src/utils/request.js`：`baseURL` 为 `/gateway`，注入 `token` 头，`code === 200` 时返回 `data`，统一处理 301-306。
4. 按钮权限用 `v-permission="'key'"`，脚本内用 `hasPermission('key')`；`*:*:*` 为超级权限。
5. 列表页用 `src/utils/table.js` 的 `useTable`（分页、查询、删除、状态切换、拖拽排序、过期请求保护）。

## 4. 主要目录

| 目录 | 内容 |
|---|---|
| `src/api/` | `courseApi` / `usersApi` / `systemApi` / `statApi` / `loginApi` / `uploadApi`，每个函数对应一个 admin 端点 |
| `src/views/system/` | app、config、faq、log、menu、role、user |
| `src/views/common/` | carousel、link、navigation、order、zone |
| `src/views/course/` | category、chapter、lessonPackage、list、record、resource、update |
| `src/views/users/` | booking、feedback、lecturer、lessonRecord、list、log、msg、record、schedule、tutor（audit / list / relation）、withdraw |
| `src/views/dashboard/`、`src/views/login/` | 工作台、登录 |
| `src/components/` | Pagination、Upload、Editor、Selector、Cascader、Enum、Icon、Preview |
| `src/utils/` | `request.js`、`table.js`、`permission.js`、`cookie.js`、`constants/system.js` |

## 5. 启动与构建

```bash
npm install
npm run dev      # http://127.0.0.1:9528，/gateway 代理到 http://localhost:7700
npm run build    # 输出 dist/（已有大 chunk 警告）
```

`npm run lint` 会对整个 `src` 执行 `--fix`；只检查改动文件时用 `npx eslint <files>`。生产部署见
`xiaoe-education-master/docs/17_正式上线部署详细方案.md` 与本仓 `nginx.conf`。

## 6. 与后端契约的硬约束

1. 只走 `/{system|user|course}/admin/**`；不调 mobile 面、不调 feign 面。
2. 请求头 `token`（不带 `Bearer`），存于 cookie `EDU_OS_ADMIN_TOKEN`。
3. 响应为 `Result<T>`（`code` / `msg` / `data`）；`200` 成功、`301` 过期、`302-305` 异常登出、`306` 无权限。
4. 仅保留 3 个 legacy 调用：`/system/api/sys/config/website`、`/system/api/common/code`、`/system/api/common/enum`，**不得新增**。
5. 新页面必须有后端菜单与按钮权限 seed（`xiaoe-education-master/docs/sql/` 日期增量 + 回滚），不得在前端写死路由。
6. 退款相关按钮受后端 RELEASE-REFUND（P0）阻塞，修复前不得扩展。

## 7. 关联文档

| 端 | 文档 |
|---|---|
| 工作区 | `AGENTS.md`、`DOCS_INDEX.md`、skill `.windsurf/skills/xiaoe-admin-web-engineering/` |
| 后端 | `docs/20_后端按Preview39屏家教O2O可上线开发方案.md`（§8 admin 端点）、`docs/12_*`、`docs/19_*`、`docs/deploy/20261018-tutoring-web-admin-report.md` |
| Android | `docs/27_*`（Admin 操作的可见结果） |
