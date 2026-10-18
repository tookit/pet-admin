# 询盘管理（Inquiries）

> 页面类型：业务流程列表 + 详情抽屉
> 推荐组件：`PageContainer`、`ProTable`、`Tabs`、`Drawer`、`ProDescriptions`、`Timeline`、`Tag`
> 截图：`../inquiry.png`

---

## 1. 页面目标

管理买家 RFQ 全流程：**待回复 → 已报价 → 已成交 → 已关闭**。目标是让「待回复」零积压。

---

## 2. 页面结构

```txt
PageContainer（标题 + 流程说明 | 右侧：导出 / 列设置）
└── ProTable
    ├── Tabs（全部 / 待回复 / 已报价 / 已成交 / 已关闭，含计数徽标）
    ├── Table
    └── Pagination
└── 询盘详情 Drawer（点击行或「详情」打开，width=430）
```

---

## 3. Tab 状态

| Tab | 计数色 |
| ---- | ---- |
| 全部 | gray 徽标 |
| 待回复 | **gold 徽标**（`--accent-500` 实底）——需处理的唯一金色提示 |
| 已报价 / 已成交 / 已关闭 | gray 徽标 |

选中 Tab：主色文字 + 2px 底部指示条。

---

## 4. 列定义

```txt
[Selection] 询盘号 | 客户 | 意向商品 | 目标数量 | 状态 | 创建时间 | 操作
```

| 列 | 规范 |
| ---- | ---- |
| 询盘号 | `INQ-1042`，mono 12px，主色 700 |
| 客户 | 公司名（500）+ 国家旗标 emoji + 联系人（11px 灰） |
| 意向商品 | 商品名；多个时「× 2」后缀 |
| 目标数量 | tabular-nums（`500 pcs`） |
| 状态 | 待回复 gold / 已报价 blue / 已成交 mint / 已关闭 gray |
| 创建时间 | tabular-nums 灰 |
| 操作 | 按状态变化：回复/报价（待回复）→ 跟进/详情（已报价）→ 订单/详情（已成交）→ 详情（已关闭） |

---

## 5. 详情 Drawer（width=430）

自上而下四个区块（区块标题：11px 大写字距 0.06em，`#9E999B`）：

### 5.1 客户信息（ProDescriptions）

公司 / 联系人 / 国家 / 邮箱（mono）/ 客户等级（mint Tag：`老客户 · 4 次成交`）

### 5.2 意向商品

迷你表格：缩略图 + 名称 + SKU | 数量 | 参考价（tabular-nums）

### 5.3 客户留言

引用块：`--n50` 底 + 2px `--primary-300` 左边线。

### 5.4 跟进时间线（Timeline）

- 事件圆点：`--primary-300`；**最新待处理事件用 `--accent-500`**
- 事件时间 11.5px 灰

### 5.5 底部操作栏（固定）

```txt
[回复询盘 (primary, flex:1)] [生成报价单 (default, flex:1)] [更多 ▾]
```

---

## 6. 交互

- 点击行打开 Drawer；Drawer 内操作成功后局部刷新时间线
- 「生成报价单」→ 报价 DrawerForm（预填商品与阶梯价）
- 批量导出 CSV；回复成功 → `message.success` + Tab 计数刷新

---

## 7. 空态 / Loading

- 无待回复：Empty「太棒了，没有待回复的询盘 🎉」
- 详情加载：Drawer 内 Skeleton
