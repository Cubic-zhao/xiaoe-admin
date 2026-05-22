# XiaoE Web Admin

> 更新时间：2026-04-28（与三端文档结构治理同步）  
> 当前定位：XiaoE 三端体系中的后台管理端  
> 对应后端面：`/system/admin/**`、`/user/admin/**`、`/course/admin/**`  
> 仓库路径：`D:/MyProject/Program/XiaoE/Xiaoe-education-release/xiaoe-education-admin`

## 1. 项目定位

当前仓库是 **XiaoE 教育系统的后台管理端**，负责为后端主仓和 Android 移动端提供可运营、可配置、可回溯的后台能力。

它不是门户前台，也不是移动端 H5。它在三端体系中的角色很明确：

1. 管理系统配置、权限、用户、角色、菜单。
2. 管理课程、分类、章节、资源、专区等运营数据。
3. 管理首页运营位、轮播、快捷入口、导航、友情链接等内容数据。
4. 为 Android 移动端主链提供稳定的数据维护入口。

## 2. 当前技术栈

- Vue 3.4
- Vite 5
- Pinia
- Vue Router 4
- Element Plus 2.6
- Axios
- wangEditor

## 3. 当前真实运行链

当前管理端的核心运行方式已经在代码中固定下来：

1. 应用从 `src/main.js` 启动。
2. 如果浏览器 cookie 中已有 token，会先调用 `loginApi.getUserInfo()` 获取当前用户、菜单、权限与动态路由数据。
3. 再通过 `createNewRouter()` 将后端返回的菜单路由动态挂载到 Layout。
4. 页面请求统一通过 `src/utils/request.js` 发出，并注入 legacy `token` 请求头。
5. 全局 `v-permission` 指令根据后端返回的权限点控制按钮和操作区显隐。

因此，当前项目的管理端运行不是“静态路由优先”，而是明显依赖后端菜单元数据驱动。

## 4. 后端契约

- 管理端主要对接 `/system/admin/**`、`/user/admin/**`、`/course/admin/**`
- 请求头使用 `token`
- 成功返回通常为 `Result<T>`
- `301` 到 `306` 业务码由请求层统一处理

这意味着管理端开发必须遵守一条底线：不能把移动端接口当成后台正式接口，也不能把后台接口误用到 Android。

## 5. 主要目录

- `src/main.js`：应用启动、当前用户拉取、动态路由注入
- `src/router/`：静态路由与动态菜单路由装配
- `src/store/modules/user.js`：当前用户、菜单、权限、面包屑
- `src/utils/request.js`：统一请求层、token 注入、全局错误码处理
- `src/api/`：后端接口映射
- `src/views/dashboard`：工作台与统计
- `src/views/system`：系统用户、角色、菜单、配置、日志
- `src/views/course`：课程、分类、章节、资源、学习记录
- `src/views/users`：讲师、学员、订单、消费记录
- `src/views/common`：轮播、导航、友情链接、专区等运营内容

## 6. 在三端全面开发方案中的职责

### 必须优先支撑 Android 主链的数据域

- 首页 banner、快捷入口、学科与专区
- 课程分类、课程、章节、资源、推荐位
- 用户、讲师、消息、订单、钱包运营数据

### 当前已经进入真实闭环的首页运营位

- `common/carousel` 当前直接对应移动端 `banner/list`
- `common/navigation` 当前直接对应移动端 `quickentry/list`
- 学科分类 `subject/list` 当前仍由后端预设数据承接，后续再进入后台可维护闭环

### 必须稳定的后台基础能力

- 登录与当前用户获取
- 菜单与动态路由
- 角色、权限、按钮权限点
- 系统配置、上传、资源、编辑器

### 本轮后台开发目标

1. 保证首页、课程、用户、消息、钱包相关数据在后台可维护。
2. 保证菜单、权限、路由元数据稳定，不拖累后台运行链。
3. 保证请求层、权限层、动态路由层不因局部功能开发被破坏。

## 7. 当前后台开发顺序

### 第一阶段：基础稳定

- 登录
- 当前用户获取
- 菜单路由注入
- 权限点渲染
- 请求层错误处理

### 第二阶段：运营数据主链

- 首页运营位
- 课程分类、课程、章节、资源
- 用户、讲师、订单、消息
- 系统配置与上传

### 第三阶段：三端联调支撑

- 校验后台维护的数据是否能真实驱动 Android 展示
- 校验后端菜单与权限元数据是否能稳定驱动管理端
- 补齐页面级自测和后台回归

## 8. 当前开发建议

- 新页面优先复用现有 `src/api/*.js + views/*/index.vue` 的 CRUD 模式。
- 不要在页面中直接使用原始 axios，请统一走 `src/utils/request.js`。
- 不要把本应由后端菜单驱动的路由写死在前端。
- 修改权限点、菜单路径、组件路径时，要同时核对后端菜单元数据。
- 涉及首页、课程、消息、钱包等对 Android 有影响的数据项时，要以“三端闭环”方式检查，而不是只看后台自己是否显示正常。

## 9. 启动

```bash
npm install
npm run dev
```

构建生产包：

```bash
npm run build
```

> **本地联调**：`npm run dev` 默认监听 `:9528`，并将 `/gateway/**` 代理到 `http://localhost:7700`（后端 Gateway）。生产部署使用 `nginx.conf` 同样的 `/gateway/` 反代规则。

---

## 10. 仓内文档导航（2026-04-28）

| 文档 | 作用 | 状态 |
|---|---|---|
| `README.md`（本文） | 仓库入口、技术栈、运行链概览 | ✅ 2026-04-28 与三端治理同步 |
| `10_Web端项目全面完整信息文档_2026-04-11.md` | Web 端全面信息基线（已加 13 节复验补记） | ✅ 2026-04-28 已对齐 |
| `20_Web端功能完善开发计划_上线运营版.md` | 上线开发计划（已加 10 节复验补记） | ✅ 2026-04-28 已对齐 |
| `30_Web端与后端v2.0治理对齐说明.md` | 110 API 端点矩阵 + admin 契约 + 与后端 Controller 对应 | ✅ 2026-04-28 本日新建 |

> Web 端文档**不归档不删除**任何历史文档。本轮只做：路径修正 + 复验补记 + 新增 30 号契约对齐文档。所有 src/ 代码**未变动**。

---

## 11. 与三端的关联文档

| 端 | 仓库 | 关键文档 |
|---|---|---|
| 后端 | `xiaoe-education-master/` | `docs/12_后端接口分层治理与迁移开发方案.md`（admin 面契约源头）/ `docs/05_service模块.md`（93 Controller 索引）/ `docs/04_gateway模块.md`（路由）/ `docs/07_系统部署与升级.md`（部署门禁） |
| Android | `xiaoe-education-android/` | `docs/22_项目基础信息与关键信息归档.md`（三端入口）/ `docs/24_Android端与后端v2.0治理对齐说明.md`（mobile 面契约对齐） |
| Web（本仓） | `xiaoe-education-admin/` | `30_Web端与后端v2.0治理对齐说明.md`（admin 面契约对齐） |
| iOS | `xiaoe-education-ios/`（占位） | 工程暂未启动 |
| 工作区根 | `Xiaoe-education-release/` | `AGENTS.md`（任意 AI agent 进入工作区前必读） |

---

## 12. 与后端契约的硬约束（不可违反）

1. **路径前缀**：管理端**只**走 `/{system\|user\|course}/admin/**`，不调 mobile 面，不调 feign 面
2. **Token Header**：`token`（不带 `Bearer ` 前缀），存于 cookie key `EDU_OS_ADMIN_TOKEN`
3. **包装体**：响应必为 `Result<T>`（3 字段：`code` / `msg` / `data`）
4. **错误码**：`200` 成功 / `301` Token 过期 / `302~305` Token 异常 / `306` 权限不足
5. **legacy api 面只 3 个端点**：`/system/api/sys/config/website`、`/system/api/common/code`、`/system/api/common/enum`，**不得新增**
6. **新页面**：必须复用 `src/api/*.js` + `views/*/index.vue` CRUD 模式，不得直接使用原始 axios

详见 `30_Web端与后端v2.0治理对齐说明.md` 第 4 章。
