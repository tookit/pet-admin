# UI Refine Tasks

## 范围与验收

以 `design/adminpro-design-docs/` 六份规范及三张 PNG 为依据，优先使用 Ant Design / Pro Components。实现 Dashboard、User Management、Profile、Security、Settings；截图中没有页面规范的 Role Management / Permission 不创建空导航。

保持现有 mock-first 架构。用户 CRUD 为内存数据；品牌、偏好和个人资料为浏览器本地设置。账单、外部集成、密码、2FA、删除账号等需要后端的操作明确显示未接入，不伪装为成功。

品牌可配置：`src/constants/app.ts` 的 `APP_CONFIG` 为默认值，用户可在 Settings 中覆盖并持久化到 `localStorage`。

## 执行列表

### T1 统一主题、品牌配置与应用外壳（已完成，提交 `6d22073`）

- [x] 配置名称、Logo、主题色；浅色/深色/系统主题；响应式侧栏、搜索、头像入口；消除重复页面标题。

### T2 用户管理（已完成）

- [x] T2a 修复 `QueryFilter` 的 `span` 类型错误，表格 `scroll={{ x: 900 }}`，工具栏与批量提示文案对齐规范。
- [x] T2b 统计卡补齐趋势/占比（Total / Active / Admins / Editors），桌面四列、平板两列、移动单列。
- [x] T2c 详情抽屉按 Basic Information / Role & Permissions / Account Status 分区；新建/编辑抽屉补头像字段。
- [x] T2d 空状态与操作反馈文案对齐规范。

### T3 Dashboard 页头与指标（已完成）

- [x] `PageContainer` + 描述 + `DatePicker.RangePicker`，日期变化刷新指标、图表、订单。
- [x] 四张 KPI 卡：Total Users / Revenue / Orders / Conversion Rate，含图标着色、数值、环比与正负趋势色。
- [x] 加载用 `Skeleton`；加载失败用 `Alert` + Retry。
- 说明：KPI 的环比是与「上一个等长区间」比较，由 mock 日序列实算，不是写死的百分比。

### T4 Dashboard 图表（已完成）

- [x] Revenue Overview：Area + Line，Revenue / Orders 切换（`Segmented`），Monthly / Weekly / Daily（`Select`），随日期范围联动。
- [x] Traffic Sources：环形图，中心显示 Total Visits，右侧图例含占比，6 个来源。
- [x] 两张图各自配 `ChartDataTable`，遵守 `CHART_TOKENS`、`NO_ENTRY_ANIMATION`、单测度单色相规则。
- 说明：环形图属分类用色，改用经校验的 `CHART_TOKENS.categorical`（浅色/深色两套，均已跑过校验脚本）。

### T5 Dashboard 底部区块（已完成）

- [x] Recent Orders：最近 5 条，状态 Badge（Paid/Processing/Pending/Failed），操作收进 `Dropdown`。
- [x] My Tasks：`List` + `Checkbox` + 优先级 Tag，勾选后置灰并提示。
- [x] Calendar：`Calendar` mini 模式，有事件的日期带圆点，选中日期下方展示当天事件。
- 说明：订单页不在本次范围内，View All 置灰并注明；Orders/View/Refund 操作提示需要后端。

### T6 Settings（已完成）

- [x] `PageContainer` + `Tabs`（General / Preferences / Notifications / Integrations），Tab 与 URL `?tab=` 双向同步，刷新保持。
- [x] General：组织信息（含 Logo）、语言与地区、外观（主题 / 主题色 / 侧栏，实时预览）、Plan & Billing（`Progress` 用量）、Account Security 快捷入口、Danger Zone（输入 DELETE 二次确认）。
- [x] Preferences：默认分页、紧凑模式、表格密度、落地页。
- [x] Notifications：邮件/推送/系统/摘要频率，自动保存。
- [x] Integrations：卡片列表与连接状态，未接入的标注为未接入而非成功。
- [x] General 底部 sticky footer：Cancel / Save Changes，脏状态才启用，保存后持久化并提示。
- 说明：General / Preferences 走 `SettingsContext` 的 preview/save/cancel 暂存编辑，外观项实时预览；未点保存就离开页面的改动不落盘。Logo 改为填 URL / `public/` 路径而非上传（上传需要文件存储）。

### T7 Profile（已完成）

- [x] 顶部概览卡：头像（在线 Badge）、姓名、角色 Tag、联系方式、签名、四项统计。
- [x] 编辑资料表单（两列，移动单列）＋ Profile Completeness 进度。
- [x] Profile Photo 上传卡（JPG/PNG/GIF，≤5MB）、Social Links（URL 校验）、Skills & Interests（`mode="tags"`，上限 10）。
- [x] Recent Activity 列表。
- 说明：Completeness 为「已填字段 / 总字段」，非隐藏权重；照片以 data URL 存入 `localStorage`，超出配额会提示。资料持久化在 `STORAGE_KEYS.PROFILE`，与 AuthContext 的登录用户相互独立。

### T8 Security（已完成）

- [x] 顶部 Security Summary：`Progress type="circle"` 安全分。
- [x] Change Password：强度指示与校验；后端未接入时明确提示。
- [x] Two-Factor Authentication：`Switch` + `QRCode` + `Input.OTP` 引导，恢复码需二次验证。
- [x] Trusted Devices 与 Active Sessions：`List`、当前设备标识、移除二次确认、Sign Out All 红色按钮 + 确认。
- [x] Recent Login Activity：成功/失败状态与异常登录提示。
- [x] Security Notifications：自动保存并轻提示。
- 说明：安全分由本页开关实算（40 基础分 + 2FA 30 + 三个开关各 10），无隐藏公式。登录记录表用 antd `Table` 而非 `ProTable`——此处只需要只读分页表，`ProTable` 的 search/toolbar 反而多余。改密码、验证 OTP、移除设备、登出全部拒绝并说明需要后端，不伪装成功。

### T9 路由、验证与交付（已完成）

- [x] `routeDefinitions.tsx` 增加 profile / security / settings，修正侧栏菜单。
- [x] `pnpm type-check`、`pnpm lint`、`pnpm build` 通过。
- [x] 桌面 / 平板 / 移动端检查核心流程；更新 README 与 CLAUDE.md。
- 说明：`/` 现在跳 `settings.landingPage`，不再写死 `/dashboard`。响应式靠栅格断点与 `scroll={{ x }}` 保证，未做真机/浏览器截图验证（本会话 chrome-devtools MCP 连接失败，见下方验证记录）。

## 提交策略

每个任务独立提交，以 `feat:` / `fix:` / `docs:` 为前缀。各阶段提交前检查实际 diff，完成后更新此列表；不推送远端。

## 验证记录

- 双条件筛选、CRUD 后统计刷新、导出转义、批量操作。
- 主题保存/取消及刷新恢复、设置 Tab 深链接。
- 移动端侧栏与表格横向滚动。

以上为设计意图，尚未在真实浏览器中逐条走查：本会话 `chrome-devtools` MCP 连接失败（`Connection closed`），无法截图或操作页面。已执行的验证只有 `pnpm type-check`、`pnpm lint`、`pnpm build`（均通过，构建仅剩既有的 >500 kB chunk 警告）。改动合并前需人工在浏览器中过一遍。
