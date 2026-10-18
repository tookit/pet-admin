# Settings

> 页面类型：系统设置  
> 推荐组件：`PageContainer`、`Tabs`、`ProCard`、`ProForm`、`Switch`、`Radio.Group`、`Select`、`Progress`、`Alert`

---

## 1. 页面目标

Settings 用于集中管理系统 / 组织级设置。

主要内容：

- General
- Preferences
- Notifications
- Integrations

当前设计默认展示 `General`。

---

## 2. 页面结构

```txt
PageContainer
├── Tabs
│   ├── General
│   ├── Preferences
│   ├── Notifications
│   └── Integrations
│
└── General
    ├── Organization Information
    ├── Language & Region
    ├── Appearance
    ├── Plan & Billing
    ├── Account Security
    └── Danger Zone
```

---

## 3. Tabs

使用：

```tsx
<Tabs />
```

Tabs：

```txt
General
Preferences
Notifications
Integrations
```

Tab 变化：

- URL 同步 `?tab=general`
- 保持刷新后状态

---

## 4. Organization Information

使用：

```txt
ProCard + ProForm
```

字段：

```txt
Organization Name
Organization Email
Website
Description
Logo
```

Card Header：

```txt
Organization Information
Basic information about your organization.

[Change Logo]
```

Description：

```txt
maxLength=200
showCount
```

---

## 5. Language & Region

字段：

```txt
Language
Timezone
Date Format
Time Format
```

### Language

Select：

```txt
English (United States)
简体中文
日本語
...
```

### Timezone

可使用带搜索的 Select。

### Date Format

```txt
YYYY-MM-DD
DD/MM/YYYY
MM/DD/YYYY
```

### Time Format

Radio：

```txt
12-hour
24-hour
```

---

## 6. Appearance

### Theme

Radio Card：

```txt
Light
Dark
System
```

可以使用：

```txt
Radio.Group + ProCard
```

### Primary Color

颜色选择：

```txt
Blue
Purple
Green
Orange
Red
Pink
Cyan
Custom
```

若希望完全基于 Ant Design，可使用 `ColorPicker`。

### Sidebar Style

```txt
Expanded
Collapsed
```

这些设置建议实时 Preview，并在 Save 后持久化。

---

## 7. Plan & Billing

展示：

```txt
Pro Plan
$49 / month
Active
Renews on Nov 10, 2026
```

Card Header：

```txt
Plan & Billing                 [Manage Billing ↗]
```

Usage：

```txt
Users
18 / 50             [Progress] 36%

Storage
12.4 GB / 100 GB    [Progress] 12%
```

使用：

```txt
Progress
Tag
Button
```

---

## 8. Account Security

可作为 Security 页面快捷入口。

设置：

```txt
Two-Factor Authentication   [Switch]
Login Notifications         [Switch]
Active Sessions             [View Sessions]
```

如果安全逻辑复杂，点击跳转：

```txt
/security
```

---

## 9. Danger Zone

单独使用浅红色 Card。

```txt
Danger Zone
Permanently delete your account and all of your data.
```

操作：

```txt
Delete Account
```

必须：

1. Modal.confirm
2. 二次身份验证
3. 输入账号名或 DELETE
4. 明确不可恢复

不可只使用普通 Popconfirm。

---

## 10. Footer Actions

General Tab 底部右侧：

```txt
Cancel
Save Changes
```

建议使用 Sticky Footer：

```txt
position: sticky;
bottom: 0;
```

但不要覆盖内容。

保存：

- dirty state 才启用
- save button loading
- 成功 message

---

## 11. Preferences Tab

建议包含：

```txt
Default Page Size
Compact Mode
Table Density
Default Landing Page
Auto Refresh Interval
```

推荐组件：

```txt
ProFormSelect
Switch
Radio.Group
```

---

## 12. Notifications Tab

分类：

```txt
Email Notifications
Push Notifications
System Notifications
Digest Frequency
```

每项：

```txt
Title
Description
Switch
```

建议支持：

```txt
Daily
Weekly
Never
```

---

## 13. Integrations Tab

卡片式列表：

```txt
Slack
Microsoft Teams
Google Workspace
GitHub
Webhook
```

状态：

```txt
Connected
Not Connected
Error
```

操作：

```txt
Connect
Configure
Disconnect
```

可使用：

```txt
List
ProCard
Tag
Button
```

---

## 14. Responsive

Desktop：

```txt
2 columns
```

Tablet：

```txt
1–2 columns
```

Mobile：

```txt
1 column
```

Tabs 可横向滚动。

---

## 15. 推荐组件

```txt
PageContainer
Tabs
ProCard
ProForm
ProFormText
ProFormSelect
ProFormTextArea
Upload
Switch
Radio.Group
Select
ColorPicker
Progress
Tag
Button
Alert
Modal.confirm
message
```
