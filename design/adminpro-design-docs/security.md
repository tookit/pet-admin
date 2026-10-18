# Security

> 页面类型：账户安全  
> 推荐组件：`PageContainer`、`ProCard`、`ProForm`、`Input.Password`、`Switch`、`QRCode`、`ProTable`、`List`、`Tag`、`Badge`、`Alert`

---

## 1. 页面目标

Security 页面用于：

- 修改密码。
- 管理 Two-Factor Authentication。
- 管理可信设备。
- 查看登录历史。
- 管理 Active Sessions。
- 配置安全通知。
- 向用户清晰表达账户安全状态。

---

## 2. 页面结构

```txt
PageContainer
├── Security Summary
├── Primary Grid
│   ├── Change Password
│   ├── Two-Factor Authentication
│   └── Trusted Devices
└── Secondary Grid
    ├── Recent Login Activity
    ├── Active Sessions
    └── Security Notifications
```

---

## 3. Security Summary

页面顶部右侧显示：

```txt
Account Protection
Your account is well protected

Security Score
92
```

推荐：

```txt
ProCard
Progress type="circle"
```

Security Score 不需要过度强调精确算法，可用于产品反馈。

---

## 4. Change Password

使用：

```txt
ProForm
Input.Password
```

字段：

```txt
Current password
New password
Confirm new password
```

### Password Strength

显示：

```txt
[■■■■□] Strong
```

规则：

```txt
至少 8 个字符
建议包含大小写
数字
特殊字符
```

提交：

```txt
Update Password
```

成功：

```txt
Password updated successfully
```

---

## 5. Two-Factor Authentication

Card Header：

```txt
Two-Factor Authentication       [Switch]
```

启用时显示 `Alert`：

```txt
✓ Two-factor authentication is enabled.
```

Authenticator Setup：

```txt
1 Open your authenticator app
2 Scan the QR code
3 Enter the 6-digit code to verify
```

二维码：

```tsx
<QRCode value={otpUrl} />
```

验证码：

```txt
Input.OTP
```

Recovery Codes：

```txt
[View Recovery Codes]
```

查看 Recovery Codes 需再次验证密码。

---

## 6. Trusted Devices

使用 `List`。

Device Item：

```txt
[Device Icon]

MacBook Pro        Current device
macOS · Chrome
Beijing, China

                         ● Active now [...]
```

Dropdown：

```txt
View details
Rename device
Remove device
```

Remove 使用 Popconfirm。

底部：

```txt
Manage All Devices
```

---

## 7. Recent Login Activity

使用 `ProTable`。

Columns：

```txt
Device
Location
IP Address
Date & Time
Status
```

Status：

```txt
Success -> green
Failed  -> red
```

异常登录可用浅红背景或 Warning Tag。

---

## 8. Active Sessions

使用 `List` 或 `ProTable`。

字段：

```txt
Device
Location
Last Active
Action
```

Current Session：

```txt
Current device
```

其他 Session：

```txt
[Sign Out]
```

Card Header：

```txt
[Sign Out All]
```

Sign Out All：

- red button
- Modal.confirm
- 当前会话是否保留根据业务决定

---

## 9. Security Notifications

每个设置行：

```txt
[Icon] New login attempts               [Switch]
       Get notified of new login attempts
```

设置：

```txt
New login attempts
Account changes
Suspicious activity
Two-factor authentication
Weekly security report
```

推荐自动保存。

保存成功可以轻提示：

```txt
Notification preference updated
```

---

## 10. 危险与异常反馈

### Failed Login

```txt
Status = Failed
```

配合：

```txt
Tag color="error"
```

### Suspicious Activity

使用：

```tsx
<Alert type="warning" showIcon />
```

示例：

```txt
We noticed a login from a new location.
```

操作：

```txt
Review activity
Secure account
```

---

## 11. Responsive

Desktop：

```txt
Primary: 1 : 1 : 1
Secondary: 1 : 1 : 1
```

Tablet：

```txt
2 columns
```

Mobile：

```txt
1 column
```

二维码在手机端居中。

---

## 12. 推荐组件

```txt
PageContainer
ProCard
ProForm
Input.Password
Progress
Switch
Alert
QRCode
Input.OTP
List
ProTable
Tag
Badge
Dropdown
Popconfirm
Modal.confirm
Button
message
```
