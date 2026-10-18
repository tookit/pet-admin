# 工作台（Dashboard）

> 页面类型：业务总览
> 推荐组件：`PageContainer`、`StatisticCard`、`ProCard`、`ProTable`、`List`、`Tag`、图表组件
> 截图：`../dashboard.png`

---

## 1. 页面目标

登录后的运营总览首页，让运营者在 5–10 秒内掌握：

- 今日询盘与商品状态
- 待处理事项（金色提示）
- 询盘趋势

---

## 2. 页面结构

```txt
PageContainer
├── Page Header（问候语 + 今日待办摘要）
├── Metrics Row（4 列 KPI）
│   ├── 今日新询盘
│   ├── 在售商品（Active）
│   ├── 待审核（Draft）      ← 金色图标底 + 金色提示
│   └── 本月询盘金额（USD）
├── Analytics Row（1.6 : 1）
│   ├── 询盘趋势 · 近 30 天（Area 图）
│   └── 待办事项（Table）
└── （可扩展：最近成交 / 日历）
```

---

## 3. Page Header

```tsx
<PageContainer
  title="早上好，Michael 👋"
  subTitle={<>今天有 <b style={{ color: '#B8851A' }}>12 条新询盘</b> 和 3 个待审核商品等待处理。</>}
/>
```

待办数字用 `--accent-700`（#B8851A），不放按钮，保持轻量。

---

## 4. KPI Cards

桌面 4 列，Tablet 2×2，Mobile 单列。每张卡：

```txt
[图标chip]  指标名
            26px 等宽粗体数值
            ▲ 12.4% vs 昨日（涨绿跌红）
```

| 指标 | 图标底色 | 说明 |
| ---- | -------- | ---- |
| 今日新询盘 | `--primary-50` | 环比昨日 |
| 在售商品 | `--primary-50` | 本周新增 SKU 数 |
| 待审核（Draft） | `--accent-100`（金色） | 显示「● 需要处理」 |
| 本月询盘金额 | `--primary-50` | USD，$ 前缀 |

图标 chip：36px 圆角 4px，Icon 18px stroke 1.8。

---

## 5. 询盘趋势

`ProCard` + Ant Design Plots Area 图：

- 主线：`#5CC4A8`，2.5px，渐变填充（透明度 .28 → 0）
- 对比线（上年同期）：`#D9D6D7` 虚线
- 悬浮点：白底 + 主色描边圆点，Tooltip 显示 ProCard 明细
- Card Header 右侧「查看报表 →」链接（`--primary-600`）

图例说明使用 11.5px mono 小字：`— 询盘量 · -- 上年同期`。

---

## 6. 待办事项

`ProTable`（迷你，无搜索区）或 `List`：

| 事项 | 类型 Tag | 操作 |
| ---- | -------- | ---- |
| 3 个商品待审核 | 待处理（gold） | 去处理 |
| 12 条新询盘未回复 | 询盘（mint） | 去回复 |
| 2 个分类缺封面图 | 媒体（gray） | 去补充 |
| 供应商资质 30 天内到期 | 紧急（red） | 去查看 |

- 操作为文字按钮（`--primary-600`）
- 类型 Tag 遵循全站「浅底 + 色点」规范

---

## 7. Loading / Empty / Error

- KPI → Skeleton
- 图表 → Spin
- 待办表 → ProTable loading
- 空态：`<Empty description="暂无待办">` + CTA「去处理询盘」

---

## 8. 响应式

| 断点 | 布局 |
| ---- | ---- |
| Desktop ≥1200 | KPI 4 列；趋势 1.6fr + 待办 1fr |
| Tablet 768–1199 | KPI 2×2；图表单列 |
| Mobile <768 | 全部单列；表格横向滚动 |
