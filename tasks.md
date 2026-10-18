# pet-portal API 集成任务

目标：把 pet-portal 从纯 mock 数据改为对接 pet-api 的核心管理能力。

范围（已确认）：

- 认证：`POST /login`、`POST /register`、`GET /me`，JWT 存 `sessionStorage`
- 用户管理：`GET/POST /users`、`PUT/DELETE /users/{id}`
- 个人资料：`GET/PATCH /me`
- Dashboard / Security 仍使用 mock 数据
- 用户模型直接对齐 pet-api 字段（`username` / `firstname` / `lastname` / `roles` / `status: 0|1|2`）

不在范围：products、categories、tags、quotes、RBAC 页面、媒体上传。

## T1 仓库基线与 HTTP 客户端

- [x] `git init`，提交当前代码作为基线
- [x] 新增 `.env.example`（`VITE_API_BASE_URL=http://localhost:8001/api/v1`）
- [x] 新增 `src/api/client.ts`：fetch 封装、Bearer token、统一错误解析、401 清理会话并跳转 `/login`
- [x] 新增 `src/types/api.ts`：`ApiUser`、`Role`、`TokenResponse`、分页/筛选参数
- [x] `pnpm type-check`、`pnpm lint` 通过

验收：构建通过；client 在无 token 时发出不带 Authorization 的请求，有 token 时附带 Bearer。

## T2 认证对接

- [x] `AuthContext` 改为保存 `access_token` + `ApiUser`
- [x] 登录调用 `POST /login`，随后 `GET /me` 取用户；失败显示 API 错误
- [x] 注册调用 `POST /register`，成功后回到登录页
- [x] 登录表单字段改为 `username` + `password`（API 以 username 登录）
- [x] 登出清理 token 和用户；401 自动跳转登录页
- [x] `pnpm type-check`、`pnpm lint` 通过

验收：错误密码显示后端错误；登录后刷新页面仍保持会话；登出后访问受保护路由跳转 `/login`。

## T3 用户管理对接

- [ ] `src/api/modules/user.api.ts` 改为真实请求，保留 `PaginatedResponse<T>` 契约
- [ ] 分页映射 `current/pageSize` → `page/per_page`
- [ ] 筛选使用 API 支持的 `search`、`status`、`role_id`（移除仅前端支持的 name/email/role 筛选）
- [ ] 表格列/操作/表单对齐 API 字段：`username`、`firstname`、`lastname`、`roles`、`status`、`created_at`
- [ ] 新增用户表单包含 `username/email/password`，编辑仅提交 API 允许的字段
- [ ] 删除用户走真实接口；无法映射的“禁用/批量”操作移除
- [ ] 概览卡片改用真实总数/各状态计数
- [ ] `pnpm type-check`、`pnpm lint` 通过

验收：列表分页、搜索、状态筛选、创建、编辑、删除均命中 pet-api；错误有 toast。

## T4 个人资料对接

- [ ] `profile.api.ts` 改为 `GET /me` / `PATCH /me`
- [ ] ProfilePage 展示真实 username、邮箱、姓名、电话、头像、注册时间
- [ ] 保存时仅提交 `firstname/lastname/phone/avatar`，成功后刷新展示
- [ ] 非 API 字段（公司、职位、社交链接等）明确保留为本地偏好或移除，不伪装成已保存
- [ ] `pnpm type-check`、`pnpm lint` 通过

验收：修改姓名/电话后刷新页面仍保留；页面不再显示固定 mock 姓名。

## T5 清理 mock 与文档

- [ ] 删除 mock 中不再使用的登录、注册、用户 CRUD、个人资料数据
- [ ] Dashboard/Security 的 mock 保留且不依赖已删除数据
- [ ] 更新 `README.md`、`CLAUDE.md`、`AGENTS.md` 中“mock-first / 无后端”的描述
- [ ] `pnpm type-check`、`pnpm lint`、`pnpm build` 全部通过

验收：全仓搜索不到页面直接引用 `@/mocks/api`；构建成功。
