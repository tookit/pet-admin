# Dashboard

> 页面类型：业务总览  
> 推荐组件：`PageContainer`、`StatisticCard`、`ProCard`、`ProTable`、`List`、`Calendar`、`Badge`、图表组件

---

## 1. 页面目标

Dashboard 是系统登录后的业务总览首页。

主要目标：

- 快速展示核心指标。
- 呈现趋势和变化。
- 提供业务异常和待办信息。
- 提供最近订单 / 记录。
- 展示日程。
- 让用户在 5–10 秒内理解系统当前状态。

---

## 2. 页面结构

```txt
PageContainer
├── Page Header
│   ├── Breadcrumb
│   ├── Dashboard
│   ├── Description
│   └── DateRangePicker
│
├── Metrics Row
│   ├── Total Users
│   ├── Revenue
│   ├── Orders
│   └── Conversion Rate
│
├── Analytics Row
│   ├── Revenue Overview
│   └── Traffic Sources
│
└── Bottom Row
    ├── Recent Orders
    ├── My Tasks
    └── Calendar
```

---

## 3. Page Header

使用 `PageContainer`。

```tsx
<PageContainer
  title="Dashboard"
  subTitle="Welcome back! Here's what's happening with your business today."
  extra={[<DatePicker.RangePicker />]}
/>
```

日期范围变化后刷新：

- Metrics
- Revenue Chart
- Traffic Sources
- Recent Orders

---

## 4. KPI Cards

### 布局

Desktop：

```txt
4 columns
```

Tablet：

```txt
2 × 2
```

Mobile：

```txt
1 column
```

### Card 内容

每张卡：

```txt
[Icon] Metric Name            +12%
       18,432                 vs last month
```

推荐：

```tsx
<StatisticCard />
```

指标：

| Metric          | Icon                 | Accent     |
| --------------- | -------------------- | ---------- |
| Total Users     | UserOutlined         | Blue       |
| Revenue         | WalletOutlined       | Green      |
| Orders          | ShoppingCartOutlined | Red/Orange |
| Conversion Rate | BarChartOutlined     | Purple     |

趋势：

- 正增长：绿色
- 负增长：红色
- 不变：灰色

---

## 5. Revenue Overview

推荐：

```txt
ProCard + Ant Design Charts
```

Card Header：

```txt
Revenue Overview
Total revenue and orders over the last 12 months.

[Revenue] [Orders] [Monthly ▼]
```

图表：

- X Axis：月份
- Y Axis：金额 / 数量
- Area + Line
- Hover Tooltip
- 选中点高亮

交互：

- Revenue / Orders 切换
- Monthly / Weekly / Daily
- Date range 联动

---

## 6. Traffic Sources

使用环形图。

Card：

```txt
Traffic Sources
Where your visitors come from.
```

中央：

```txt
12,480
Total Visits
```

右侧 Legend：

```txt
Organic Search   40%
Direct           24%
Referral         16%
Social Media     12%
Email             6%
Paid Ads          2%
```

图表颜色保持区分但不过度饱和。

---

## 7. Recent Orders

使用 `ProTable`。

推荐字段：

```ts
['#', 'Customer', 'Product', 'Amount', 'Status', 'Created At', 'Actions'];
```

Status：

- Paid → success
- Processing → processing
- Pending → warning
- Failed → error

Actions：

```txt
View
Edit
Refund
More
```

默认只显示 `...`，点击 `Dropdown`。

Card Header 右侧：

```txt
View All →
```

Dashboard 只展示最近 5 条。

---

## 8. My Tasks

使用：

```txt
List
Checkbox
Tag
```

Item：

```txt
☐ Review new user registrations     High
   3 pending approvals
```

Priority：

- High → red
- Medium → blue
- Low → default

勾选后：

- 文本变灰
- 可增加删除线
- 显示 `message.success`

---

## 9. Calendar

使用 `Calendar` 的 mini 模式。

内容：

```txt
October 2026
Su Mo Tu We Th Fr Sa
```

选中日期下方显示当天事件：

```txt
● Team sync meeting      10:00–11:00
● Product update review  14:00–15:00
● Design workshop        16:00–17:00
```

事件使用不同颜色 `Badge` 区分。

---

## 10. 响应式

### Desktop

```txt
Metrics: 4 columns
Analytics: 2 columns (2:1)
Bottom: 2:1:1
```

### Tablet

```txt
Metrics: 2 columns
Charts: 1 column
Bottom: 1 column
```

### Mobile

全部单列。

图表保持最小高度：

```txt
280px
```

表格：

```css
overflow-x: auto;
```

---

## 11. Loading / Empty / Error

### Loading

- KPI → Skeleton
- Chart → Spin
- Table → loading

### Empty

Orders / Tasks：

```tsx
<Empty description="No recent data" />
```

### Error

图表接口错误：

```txt
Unable to load analytics.
[Retry]
```

---

## 12. 推荐组件清单

```txt
PageContainer
StatisticCard
ProCard
ProTable
DatePicker.RangePicker
Segmented
Select
List
Checkbox
Tag
Badge
Calendar
Dropdown
Skeleton
Spin
Empty
```
