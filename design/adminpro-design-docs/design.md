# AdminPro Design System

> 技术栈：Ant Design 5 + Ant Design Pro Components  
> 适用范围：后台管理模板所有页面  
> 设计关键词：Modern / Clean / Professional / Data-first

---

## 1. 设计目标

AdminPro 是一套面向 SaaS、企业内部系统及中后台产品的现代化后台管理模板。

设计目标：

- 保持 Ant Design 原生交互习惯，降低学习成本。
- 使用 Ant Design Pro Components 提升页面开发效率。
- 强化数据层级，让关键数据、状态、操作一眼可见。
- 减少大面积纯白和过度线框，使用浅背景、卡片、留白构建层次。
- 所有页面遵循统一的布局、色彩、圆角、阴影和间距规范。
- Desktop First，同时保证 Tablet / Mobile 下可用。

---

## 2. 技术与组件原则

### 2.1 基础组件库

使用：

```txt
antd
@ant-design/icons
@ant-design/pro-components
```

推荐主要组件：

| 场景         | 推荐组件                         |
| ------------ | -------------------------------- |
| 应用布局     | `ProLayout`                      |
| 页面容器     | `PageContainer`                  |
| 卡片         | `ProCard` / `Card`               |
| 数据表格     | `ProTable`                       |
| 查询表单     | `QueryFilter` / `ProForm`        |
| 普通表单     | `ProForm`                        |
| 详情展示     | `ProDescriptions`                |
| 指标数据     | `StatisticCard` / `Statistic`    |
| 标签页       | `Tabs`                           |
| 抽屉         | `DrawerForm`                     |
| 弹窗         | `ModalForm`                      |
| 上传         | `Upload` / `ProFormUploadButton` |
| 时间线       | `Timeline`                       |
| 空状态       | `Empty`                          |
| 加载状态     | `Spin` / `Skeleton`              |
| 状态标签     | `Tag` / `Badge`                  |
| 下拉菜单     | `Dropdown`                       |
| 危险操作确认 | `Popconfirm` / `Modal.confirm`   |

### 2.2 开发原则

1. 优先使用 Ant Design / Pro Components 已有能力。
2. 不重复实现已有组件。
3. 页面级布局使用 `PageContainer`。
4. 列表页优先使用 `ProTable`。
5. 搜索条件优先使用 `QueryFilter` 或 `ProTable` 内置搜索。
6. 新建 / 编辑优先使用 `DrawerForm`；简单操作可使用 `ModalForm`。
7. 表单字段统一使用 `ProForm*`。
8. 使用 Design Token 而不是散落的硬编码样式。

---

## 3. 设计风格

整体采用明亮、清爽、轻量化 SaaS 后台风格。

### 3.1 视觉关键词

- 浅色主题
- 低对比背景
- 白色卡片
- 轻阴影
- 柔和圆角
- 高信息密度但保持充足留白
- 蓝色作为主要操作色
- 状态颜色只用于表达语义

### 3.2 页面层级

```txt
App
└── ProLayout
    ├── Sidebar
    ├── Header
    └── PageContainer
        ├── Page Header
        ├── Summary / Metrics
        ├── Main Content
        └── Secondary Content
```

---

## 4. 配色系统

建议以 Ant Design Token 为基础。

### 4.1 主色

| Token          |    建议值 | 用途                 |
| -------------- | --------: | -------------------- |
| `colorPrimary` | `#1677FF` | 主按钮、链接、选中态 |
| `colorInfo`    | `#1677FF` | 信息态               |
| `colorSuccess` | `#22C55E` | 成功、启用、在线     |
| `colorWarning` | `#F59E0B` | 警告、待处理         |
| `colorError`   | `#EF4444` | 错误、删除、危险操作 |

### 4.2 中性色

| 名称       |      色值 | 用途                 |
| ---------- | --------: | -------------------- |
| 页面背景   | `#F5F7FB` | 页面整体背景         |
| 卡片背景   | `#FFFFFF` | 卡片、表格、内容容器 |
| 一级文字   | `#1F2937` | 标题、关键数据       |
| 二级文字   | `#6B7280` | 描述、辅助信息       |
| 三级文字   | `#9CA3AF` | Placeholder、弱提示  |
| 边框       | `#E5E7EB` | 卡片边界、表格分隔   |
| Hover 背景 | `#F8FAFC` | 表格行 / 菜单 hover  |

### 4.3 辅助色

- 紫色：`#8B5CF6`
- 青色：`#06B6D4`
- 粉色：`#EC4899`
- 橙色：`#F97316`

辅助色用于统计卡片、图表、类别区分，不用于主要 CTA。

---

## 5. 字体规范

### 5.1 字体栈

```css
font-family:
  Inter,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'PingFang SC',
  'Microsoft YaHei',
  sans-serif;
```

### 5.2 字号

| 场景     |    字号 |    字重 |
| -------- | ------: | ------: |
| 页面标题 |    24px |     600 |
| 区块标题 |    18px |     600 |
| 卡片标题 |    16px |     600 |
| 正文     |    14px |     400 |
| 辅助文字 |    12px |     400 |
| 大型指标 | 24–28px | 600/700 |
| Button   |    14px |     500 |

建议行高：

- 标题：1.3
- 正文：1.5
- 辅助文字：1.4

---

## 6. 圆角、阴影与边框

### 6.1 圆角

```txt
Card: 12px
Button: 8px
Input / Select: 8px
Tag: 6px
Modal / Drawer 内部卡片: 10px
```

可通过 Ant Design Token：

```ts
{
  borderRadius: 8,
  borderRadiusLG: 12
}
```

### 6.2 阴影

卡片默认保持轻阴影：

```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
```

Hover 可提升为：

```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
```

避免大面积浓重阴影。

### 6.3 边框

默认：

```css
border: 1px solid #e5e7eb;
```

主要依赖背景和留白建立层级，边框只用于必要结构。

---

## 7. 间距系统

使用 8px 基础网格。

```txt
4 / 8 / 12 / 16 / 24 / 32 / 40 / 48
```

推荐：

| 场景             |    间距 |
| ---------------- | ------: |
| 页面上下 padding |    24px |
| 大区块之间       |    24px |
| 卡片之间         | 16–24px |
| 卡片内边距       | 20–24px |
| Form Item 间距   |    16px |
| 图标与文字       |     8px |
| 标题与描述       |   4–8px |

---

## 8. 全局布局

### 8.1 Sidebar

使用 `ProLayout`。

建议：

```txt
展开宽度：208–224px
折叠宽度：64px
背景：#FFFFFF
边界：右侧 1px solid #EEF0F3
```

菜单选中态：

- 背景：`#EAF3FF`
- 文字：`#1677FF`
- 图标：`#1677FF`
- 左侧可增加 3px 主题色指示条

侧边栏内容：

```txt
Logo
Dashboard
User Management
Role Management
Permission
Analytics
Profile
Security
Settings
```

底部可放：

- 版本号
- Documentation CTA
- Collapse 按钮

### 8.2 Header

高度建议 56–64px。

内容：

```txt
[Menu Collapse]
[Global Search]
                      [Notification] [Settings] [Avatar + Name]
```

推荐组件：

- `Input.Search`
- `Badge`
- `Dropdown`
- `Avatar`
- `Space`

Header 固定时需要处理 PageContainer 顶部间距。

### 8.3 Main Content

```txt
background: #F5F7FB;
padding: 24px;
```

推荐最大内容宽度：

```txt
1200–1600px
```

超宽屏可居中限制。

---

## 9. PageContainer 规范

每个业务页面统一使用：

```tsx
<PageContainer
  title="Page Title"
  subTitle="Page description"
  breadcrumb={...}
  extra={[...]}
>
  ...
</PageContainer>
```

Header 信息顺序：

1. Breadcrumb
2. Page title
3. Description
4. Page-level actions

不应在内容区重复页面主标题。

---

## 10. 卡片规范

推荐 `ProCard`。

卡片分类：

### Summary Card

用于 KPI：

- 左：图标
- 中：指标名 + 值
- 右：增长率 / 环比

### Content Card

用于：

- 表单
- 图表
- Timeline
- 列表
- 配置项

### Danger Card

使用浅红背景，仅用于：

- Delete account
- Sign out all sessions
- Remove device
- Irreversible action

---

## 11. 表格规范

使用 `ProTable`。

默认风格：

- 表头浅灰背景
- row height 48–56px
- Hover 显示浅灰
- 关键字段左对齐
- 数字右对齐
- 操作列固定右侧

建议列顺序：

```txt
Selection
ID
Primary Entity
Secondary Info
Role / Type
Status
Date
Actions
```

Actions：

```txt
View
Edit
Duplicate
Delete
```

展示方式：

- 高频操作直接显示
- 其他操作收进 `Dropdown`
- 删除放在下拉菜单底部并标红

---

## 12. 表单规范

使用 `ProForm`。

建议：

- 两列布局用于桌面端编辑页
- Tablet 降为单列
- 说明信息放在 label 下或 tooltip
- 必填项使用框架默认 `*`

保存按钮：

```txt
Cancel | Save Changes
```

主按钮始终放右侧。

大型编辑操作推荐 Drawer：

```tsx
<DrawerForm width={560} />
```

---

## 13. 状态语义

| 状态       | 表现              |
| ---------- | ----------------- |
| Active     | green Badge / Tag |
| Pending    | gold / orange     |
| Processing | blue              |
| Disabled   | default / gray    |
| Error      | red               |
| Draft      | default           |
| Admin      | red / volcano     |
| Editor     | blue              |
| Viewer     | neutral           |

避免随机颜色，同类状态保持一致。

---

## 14. 响应式规范

### Desktop ≥ 1200px

- Sidebar 展开
- 多列布局
- 图表并排
- KPI 四列

### Tablet 768–1199px

- Sidebar 可折叠
- KPI 两列
- 图表改单列
- 表单两列或一列

### Mobile < 768px

- Sidebar Drawer
- KPI 单列
- 所有内容卡片单列
- Table 允许横向滚动
- Page Header action 放入 Dropdown

---

## 15. 交互反馈

统一使用：

- `message.success`
- `message.error`
- `notification`
- `Popconfirm`
- `Skeleton`
- `Spin`
- `Empty`

### Loading

- 页面：Skeleton
- 表格：ProTable loading
- Button：Button loading

### Empty

必须提供：

- 原因说明
- 下一步 CTA

### Error

错误信息必须可理解，不直接显示后端堆栈。

---

## 16. 推荐主题配置

```ts
const theme = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',

    colorBgLayout: '#F5F7FB',
    colorBgContainer: '#FFFFFF',

    colorText: '#1F2937',
    colorTextSecondary: '#6B7280',

    borderRadius: 8,
    borderRadiusLG: 12,

    fontSize: 14,
  },
};
```

---

## 17. 页面文档索引

```txt
design.md
dashboard.md
user-management.md
profile.md
security.md
settings.md
```

所有页面均应遵循本文件定义的设计系统。
