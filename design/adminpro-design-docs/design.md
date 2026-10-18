# Petpallets Admin Design System

> 技术栈：Ant Design 5 + Ant Design Pro Components
> 适用范围：pet-portal 管理后台所有页面
> 设计关键词：Swiss / Data-first / Mint Teal / Precise
> 品牌依据：`html/DESIGN.md`（Petpallets B2B 品牌体系）+ 品牌 Logo（薄荷绿猫头）

---

## 0. 品牌来源

主题色直接从品牌 Logo 提取：

| 来源 | 色值 | 用途 |
| ---- | ---- | ---- |
| Logo 猫头 | `#7FD1BE` / `#5CC4A8` | 主色系（Mint Teal） |
| Logo 胡须/高光 | `#E7AD42` / `#F2D031` | 强调色（Warm Gold） |
| Logo 瞳孔 | `#272425` | 中性色系基准（Cool Gray） |

完整色阶与设计原则参见 `html/DESIGN.md`。整体视觉方案见 `html/pet-admin-redesign.html`，各屏截图在本目录 `*.png`。

---

## 1. 设计目标

- 保持 Ant Design 原生交互习惯，降低学习成本。
- 使用 ProComponents（ProLayout / ProTable / PageContainer / DrawerForm）提升开发效率。
- **数据大于装饰**：表格、指标、筛选优先；渐变与插画只出现在登录页品牌区。
- **金色一屏一处**：`#E7AD42` 仅用于「待处理」类元素（待办徽标、低库存、紧急项），严禁装饰性使用。
- 浅色侧栏 + 白色卡片 + 充足留白，Logo 深灰文字作为唯一视觉焦点。
- Desktop First，Tablet / Mobile 保证可用。

---

## 2. 技术与组件原则

### 2.1 基础组件库

```txt
antd
@ant-design/icons
@ant-design/plots
@ant-design/pro-components
```

| 场景 | 推荐组件 |
| ---- | -------- |
| 应用布局 | `ProLayout`（layout="side"，light 侧栏） |
| 页面容器 | `PageContainer` |
| 数据表格 | `ProTable` |
| 查询表单 | `QueryFilter` / ProTable 内置搜索（默认收起 3 项） |
| 新建/编辑 | `DrawerForm`（宽 640）；简单操作用 `ModalForm` |
| 详情展示 | `ProDescriptions` / `Descriptions` |
| 指标数据 | `StatisticCard` / `Statistic` |
| 询盘详情 | `Drawer` + `Timeline` + `Descriptions` |
| 媒体上传 | `Upload.Dragger` + `Image.PreviewGroup` |
| 图表 | `@ant-design/plots`（Area 主线 `#5CC4A8`，对比线 `#D9D6D7` 虚线） |
| 状态标签 | `Tag`（浅底 + 语义色点）/ `Badge` |

### 2.2 开发原则

1. 优先使用 antd / ProComponents 已有能力，不重复造轮子。
2. 页面级布局统一 `PageContainer`；列表页统一 `ProTable`。
3. 使用 Design Token，禁止散落的硬编码颜色。
4. 金额、库存、时间戳统一 `tabular-nums` 等宽数字并右对齐。

---

## 3. 配色系统

### 3.1 主色 — Mint Teal（Logo 提取）

| Token | 色值 | 用途 |
| ----- | ---- | ---- |
| `--primary-50` | `#F2FBF8` | 选中菜单背景、浅底标签 |
| `--primary-100` | `#DFF5EE` | 卡片浅底、信息区 |
| `--primary-300` | `#9FE0C5` | 轻边框、focus ring |
| `--primary-400` | `#7FD1BE` | Logo 主色 |
| `--primary-500` | `#5CC4A8` | **colorPrimary**：主按钮、链接、选中态 |
| `--primary-600` | `#45B095` | hover / active |
| `--primary-700` | `#368F79` | 菜单选中文字、深强调 |
| `--primary-900` | `#1A473D` | 登录页品牌区深端 |

### 3.2 强调色 — Warm Gold（克制使用）

| Token | 色值 | 用途 |
| ----- | ---- | ---- |
| `--accent-100` | `#FDF5E0` | 待处理标签浅底 |
| `--accent-500` | `#E7AD42` | colorWarning、待办徽标、低库存、紧急项 |
| `--accent-700` | `#B8851A` | 浅底上的金色文字 |

### 3.3 中性色 — Cool Gray（Logo 瞳孔衍生）

| 名称 | 色值 | 用途 |
| ---- | ---- | ---- |
| 页面背景 | `#F7F6F7` | colorBgLayout |
| 卡片背景 | `#FFFFFF` | 卡片、表格、侧栏 |
| 表头背景 | `#F7F6F7` | Table headerBg |
| 边框 | `#EDEBEC` | 卡片边界、表格分隔 |
| 输入框边框 | `#D9D6D7` | Input / Select |
| Placeholder | `#BEBABB` | 弱提示 |
| 二级文字 | `#7E787A` | 描述、辅助 |
| 一级文字 | `#272425` | colorTextBase（Logo 瞳孔色） |

### 3.4 语义色

| 状态 | 色值 | 场景 |
| ---- | ---- | ---- |
| Success | `#2D8C5A` | 在售、审核通过 |
| Warning | `#E7AD42` | 低库存、待回复、待处理 |
| Error | `#D14343` | 缺货、失败、危险操作 |
| Info | `#3B82C4` | 分类标签、处理中 |

状态标签统一形式：**浅色底 + 语义色圆点 + 深色文字**，禁止纯色块大标签。

---

## 4. 字体

```css
font-family: 'Inter', 'Noto Sans SC', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

| 场景 | 字号 | 字重 |
| ---- | ---- | ---- |
| 页面标题（PageContainer） | 20px | 700 |
| 卡片/区块标题 | 14–15px | 600 |
| 正文/表格 | 13–14px | 400 |
| 辅助文字 | 12px | 400 |
| 大型指标 | 26px | 700（tabular-nums） |
| Button | 13.5–14px | 500 |

数字场景（价格、库存、询盘号、时间戳）一律 `font-variant-numeric: tabular-nums`。

---

## 5. 圆角、阴影与边框

Swiss 精确感，小圆角、轻阴影：

```ts
{ borderRadius: 4, borderRadiusLG: 6 }
```

```css
/* 卡片默认边框优先于阴影 */
border: 1px solid #EDEBEC;
/* 仅悬浮/浮层使用阴影 */
box-shadow: 0 1px 2px rgba(39,36,37,.06);   /* sm */
box-shadow: 0 2px 8px rgba(39,36,37,.08);   /* md，Dropdown/Drawer */
box-shadow: 0 4px 16px rgba(39,36,37,.10);  /* lg，Modal */
```

禁止大面积浓重阴影。

---

## 6. 间距

8px 基础网格：`4 / 8 / 12 / 16 / 24 / 32`。

| 场景 | 间距 |
| ---- | ---- |
| 内容区 padding | 24px |
| 卡片间距 | 16px（KPI 行）/ 20px（网格） |
| 卡片内边距 | 18–20px |
| 表格单元格 | 11–12px 垂直 |
| 图标与文字 | 8px |

---

## 7. 全局布局

### 7.1 Sidebar（ProLayout，light）

```txt
宽度：216px（折叠 64px）
背景：#FFFFFF，右侧 1px solid #EDEBEC
Logo：logo-symbol.svg（28px 高）+ "Petpallets"（薄荷绿 em 强调）
分组：运营 / 商品 / 系统 三组小标题（11px, #BEBABB, 600）
```

菜单选中态：

```ts
Menu: {
  itemSelectedBg: '#F2FBF8',
  itemSelectedColor: '#368F79',
  itemBorderRadius: 4,
  itemMarginInline: 8,
}
```

菜单结构：

```txt
运营：工作台 / 询盘管理（金色徽标=待回复数）
商品：商品列表 / 分类与属性 / 媒体库
系统：用户与权限 / 系统设置
```

### 7.2 Header

高度 56px，白底，下边框 `#EDEBEC`：

```txt
[Breadcrumb] ················ [Search] [通知(红点)] [Avatar]
```

### 7.3 Main Content

```txt
background: #F7F6F7;
padding: 24px;
max-width: 1600px;
```

---

## 8. 状态语义

| 状态 | 表现 |
| ---- | ---- |
| 在售 Active | mint Tag（`#F2FBF8` 底 + `#5CC4A8` 点） |
| 待回复 / 待处理 / 低库存 | gold Tag（`#FDF5E0` 底 + `#E7AD42` 点） |
| 已报价 / 处理中 | blue Tag |
| 草稿 Draft / 已关闭 | gray Tag |
| 缺货 / 失败 | red Tag |
| 已成交 | mint Tag |

同类状态全站保持一致；待办数量徽标用 `#E7AD42` 实底 + 深灰文字。

---

## 9. 推荐主题配置

```ts
// src/theme/adminTheme.ts — 品牌主题（Petpallets Admin）
export const adminTheme = {
  token: {
    colorPrimary: '#5CC4A8',
    colorInfo: '#5CC4A8',
    colorSuccess: '#2D8C5A',
    colorWarning: '#E7AD42',
    colorError: '#D14343',
    colorTextBase: '#272425',
    colorBgLayout: '#F7F6F7',
    borderRadius: 4,
    fontFamily: "'Inter','Noto Sans SC',-apple-system,'PingFang SC',sans-serif",
  },
  components: {
    Layout: { siderBg: '#FFFFFF', headerBg: '#FFFFFF', headerHeight: 56 },
    Menu: { itemSelectedBg: '#F2FBF8', itemSelectedColor: '#368F79', itemBorderRadius: 4, itemMarginInline: 8 },
    Table: { headerBg: '#F7F6F7', headerColor: '#484345', rowHoverBg: '#FAFAF9' },
    Button: { primaryShadow: 'none', fontWeight: 500 },
    Card: { borderColor: '#EDEBEC' },
  },
};
```

---

## 10. 设计原则

1. **数据大于装饰。** 表格、指标、筛选优先；装饰只出现在登录页品牌区。
2. **金色一屏一处。** `#E7AD42` 只用于待处理类元素，永不装饰。
3. **等宽数字。** 价格、库存、ID、时间全部 tabular-nums、右对齐。
4. **浅色侧栏。** 白底 + 薄荷绿 50 选中块，与深灰 Logo 文字形成唯一焦点。
5. **小圆角 + 轻阴影。** 全局 4px；只用 sm/md 阴影。
6. **状态标签浅底化。** 浅色底 + 色点 + 深色文字，保持表格可扫读。

---

## 11. 页面文档索引

| 文档 | 页面 | 截图 |
| ---- | ---- | ---- |
| `dashboard.md` | 工作台 | `dashboard.png` |
| `product-list.md` | 商品列表 | `list.png` |
| `inquiry.md` | 询盘管理 | `inquiry.png` |
| `media.md` | 媒体库 | `media.png` |
| `login.md` | 登录 | `login.png` |
| `user-management.md` | 用户管理 | — |
| `profile.md` | 个人资料 | — |
| `security.md` | 安全设置 | — |
| `settings.md` | 系统设置 | `settings.png`（旧版，待更新） |

所有页面均应遵循本文件定义的设计系统。视觉总览与可交互源文件：`html/pet-admin-redesign.html`。
