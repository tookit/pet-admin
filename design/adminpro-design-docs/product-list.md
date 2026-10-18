# 商品列表（Catalog · Products）

> 页面类型：核心列表页
> 推荐组件：`PageContainer`、`ProTable`、`QueryFilter`、`DrawerForm`、`Tag`、`Dropdown`、`Popconfirm`
> 截图：`../list.png`

---

## 1. 页面目标

管理全量商品（在售 / 草稿 / 下架），支持批量操作与 MOQ 阶梯价格的快速扫读。

---

## 2. 页面结构

```txt
PageContainer（标题 + 统计副标题 | 右侧：导出 CSV / 新建商品）
└── ProTable
    ├── QueryFilter（默认收起 3 项：名称/SKU、分类、状态 + 展开更多）
    ├── Toolbar（批量上架 / 批量下架 / 已选计数 | 刷新 / 列设置）
    ├── Table
    └── Pagination（右对齐，总数前置）
```

---

## 3. 查询区

默认展示 3 项，其余收进「展开更多筛选 ▾」（`--primary-600` 文字链）：

| 字段 | 组件 |
| ---- | ---- |
| 商品名称 / SKU | Input（placeholder「请输入名称或 SKU」） |
| 分类 | TreeSelect（「全部分类」） |
| 状态 | Select（全部状态） |
| 供应商 / 认证 / 价格区间 | 收起区 |

按钮：查询（primary）+ 重置（default）。

---

## 4. 列定义

```txt
[Selection] 商品 | 分类 | 价格阶梯（MOQ） | 库存 | 状态 | 更新时间 | 操作
```

| 列 | 规范 |
| ---- | ---- |
| 商品 | 36px 缩略图（白底圆角 4px）+ 名称（500）+ SKU（mono 11px 灰） |
| 分类 | blue Tag（`#EAF2FA` 底） |
| 价格阶梯 | tabular-nums：`$4.20 / 100+ · $3.65 / 500+`；CNY 用 ¥ 前缀 |
| 库存 | tabular-nums；<100 金色加粗；0 红色加粗 |
| 状态 | 在售 mint / 低库存 gold / 草稿 gray / 缺货 red（浅底+色点） |
| 更新时间 | `YYYY-MM-DD HH:mm`，`#9E999B` |
| 操作 | 编辑 / 预览 / 更多 ▾（文字按钮，更多收进 Dropdown，删除红色置底） |

---

## 5. 工具栏

```txt
[批量上架] [批量下架]  已选 0 项 ············ [刷新] [列设置]
```

- 批量按钮在未选中时可禁用
- 危险操作（批量删除）用 `Popconfirm`

---

## 6. 新建 / 编辑

`DrawerForm`（width=640）：

- 基础信息：名称（EN/ZH）、SKU、分类（级联）、状态
- 价格与 MOQ：阶梯价 EditableProTable（数量下限 / 单价 / 币种）
- 媒体：从媒体库选择或上传（`Upload.Dragger`）
- 保存 → `message.success` + 表格 reload

上架/下架用 `Popconfirm`；删除必须二次确认并标红。

---

## 7. 空态 / Loading

- 无商品：Empty + 「新建商品」CTA
- 搜索无结果：Empty + 「重置筛选」
- 加载：ProTable loading
