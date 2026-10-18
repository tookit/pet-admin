# User Management

> 页面类型：数据列表 / 用户管理  
> 推荐组件：`PageContainer`、`ProTable`、`StatisticCard`、`QueryFilter`、`DrawerForm`、`Dropdown`、`Avatar`、`Tag`、`Badge`

---

## 1. 页面目标

User Management 用于：

- 查看系统用户。
- 搜索和筛选用户。
- 创建用户。
- 修改用户。
- 管理角色和账号状态。
- 删除 / 禁用用户。
- 导出数据。

---

## 2. 页面结构

```txt
PageContainer
├── Header
│   ├── User Management
│   ├── Description
│   └── New User
│
├── Summary Cards
│   ├── Total Users
│   ├── Active Users
│   ├── Admins
│   └── Editors
│
├── Search / Filter Card
│   ├── Display Name
│   ├── Email
│   ├── Role
│   ├── Status
│   ├── Reset
│   └── Search
│
└── User Table
    ├── Toolbar
    ├── Table
    └── Pagination
```

---

## 3. Header

```tsx
<PageContainer
  title="User Management"
  subTitle="Manage your team members, roles and account permissions."
  extra={[
    <Button type="primary" icon={<PlusOutlined />}>
      New User
    </Button>,
  ]}
/>
```

New User 推荐使用：

```txt
DrawerForm
width = 560
```

---

## 4. Summary Cards

四个统计卡：

```txt
Total Users
Active Users
Admins
Editors
```

推荐使用：

```tsx
<StatisticCard />
```

每个卡包含：

- Icon
- Label
- Value
- Trend / Percentage

---

## 5. Search & Filter

推荐使用：

```tsx
<QueryFilter />
```

字段：

```txt
Display name
Email
Role
Status
```

### Display Name

```tsx
<ProFormText name="displayName" label="Display name" />
```

### Email

```tsx
<ProFormText name="email" label="Email" />
```

### Role

```tsx
<ProFormSelect
  name="role"
  options={[
    { label: 'Admin', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ]}
/>
```

### Status

```txt
Active
Inactive
Suspended
Pending
```

---

## 6. ProTable

建议：

```tsx
<ProTable<User> rowKey="id" search={false} pagination={{ pageSize: 10 }} />
```

Columns：

### Select

启用 `rowSelection`。

### ID

窄列。

### User

建议合并：

```txt
Avatar + Display Name
```

Avatar：

- 优先图片
- 无图片时使用首字母

### Email

右侧可显示 Copy Icon。

### Role

Tag：

```txt
Admin  -> red
Editor -> blue
Viewer -> default
```

### Status

使用 Badge：

```txt
● Active
● Inactive
● Suspended
```

### Created At

格式：

```txt
YYYY-MM-DD
```

### Actions

只显示：

```txt
...
```

Dropdown：

```txt
View
Edit
Duplicate
Disable
Delete
```

Delete：

```txt
danger: true
```

并使用 `Popconfirm` / `Modal.confirm`。

---

## 7. Table Toolbar

左侧：

```txt
18 users in total
```

右侧：

```txt
Export
Refresh
Density
Column Settings
```

`ProTable` 自带：

- reload
- density
- setting

Export 使用普通 Button。

---

## 8. New / Edit User

推荐 `DrawerForm`。

内容：

```txt
Avatar
Display Name *
Email *
Role *
Status
Phone
Department
Notes
```

布局：

```txt
Desktop Drawer: 1 column
```

Footer：

```txt
Cancel
Create User
```

Edit：

```txt
Cancel
Save Changes
```

---

## 9. View User

可选择：

```txt
Drawer
```

内部推荐：

```tsx
<ProDescriptions />
```

分区：

```txt
Basic Information
Role & Permissions
Account Status
Recent Activity
```

---

## 10. 批量操作

选择多个用户后出现批量 Toolbar：

```txt
3 selected
[Activate]
[Disable]
[Delete]
```

Delete 必须二次确认。

---

## 11. Empty State

无用户：

```txt
No users yet
Create your first user to get started.

[New User]
```

使用 `Empty`。

---

## 12. Error & Feedback

成功：

```ts
message.success('User created successfully');
```

失败：

```ts
message.error('Unable to update user');
```

---

## 13. Responsive

### Desktop

完整列显示。

### Tablet

隐藏：

```txt
ID
Created At
```

### Mobile

保留：

```txt
User
Role
Status
Actions
```

ProTable 横向滚动：

```tsx
scroll={{ x: 900 }}
```

---

## 14. 推荐组件

```txt
PageContainer
StatisticCard
ProTable
QueryFilter
ProForm
DrawerForm
ModalForm
Avatar
Tag
Badge
Dropdown
Button
Popconfirm
Empty
message
```
