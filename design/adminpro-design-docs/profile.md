# Profile

> 页面类型：个人资料  
> 推荐组件：`PageContainer`、`ProCard`、`ProForm`、`Avatar`、`Upload`、`Progress`、`Tag`、`List`、`Timeline`

---

## 1. 页面目标

Profile 页面用于：

- 展示用户身份信息。
- 修改个人资料。
- 上传头像。
- 管理个人社交链接。
- 管理 Skills & Interests。
- 查看近期账户活动。

---

## 2. 页面结构

```txt
PageContainer
├── Profile Summary
├── Main Grid
│   ├── Left
│   │   ├── Edit Profile
│   │   └── Recent Activity
│   └── Right
│       ├── Profile Photo
│       ├── Social Links
│       └── Skills & Interests
```

---

## 3. Profile Summary

使用 `ProCard`。

结构：

```txt
[Avatar]

Wangqiangshen   [Administrator]

✉ Email
☎ Phone
⌖ Location
▣ Joined date

"Building better products for a brighter future."

                    [Team Members] [Projects] [Contributions] [Days Active]
```

### Avatar

```tsx
<Badge dot color="green">
  <Avatar size={88} />
</Badge>
```

### Role

```tsx
<Tag color="blue">Administrator</Tag>
```

---

## 4. Edit Profile

使用 `ProForm`。

建议桌面端两列：

```tsx
<ProForm.Group>
  <ProFormText name="fullName" />
  <ProFormText name="displayName" />
</ProForm.Group>
```

字段：

```txt
Full Name *
Display Name *
Email Address *
Phone Number
Company
Job Title
Timezone
Bio
```

Email 可根据业务决定是否 readonly。

### Profile Completeness

Card Header 右侧：

```txt
Profile Completeness    80%
[Progress]
```

使用：

```tsx
<Progress percent={80} size="small" />
```

---

## 5. Profile Photo

卡片：

```txt
Profile Photo
Upload a new photo to personalize your account.
```

布局：

```txt
[Current Avatar] [Upload Drop Zone]
```

Upload：

```tsx
<Upload.Dragger />
```

限制：

```txt
JPG
PNG
GIF
Max 5 MB
```

上传成功后：

```ts
message.success('Profile photo updated');
```

---

## 6. Social Links

字段：

```txt
LinkedIn
GitHub
X / Twitter
Website
```

每行：

```txt
[Icon] [URL Input]
```

推荐 `ProFormText`。

URL 需要校验：

```txt
type: 'url'
```

---

## 7. Skills & Interests

推荐：

```txt
Select mode="tags"
```

例如：

```txt
Product Management
Team Leadership
React
```

允许：

- 输入新增
- 删除 Tag
- 最多 10 个

---

## 8. Recent Activity

使用：

```txt
List
```

或：

```txt
Timeline
```

示例：

```txt
● Logged in successfully
  Chrome on macOS · 192.168.1.1
  Oct 26, 2026 10:24

● Updated profile information
  Changed your job title
  Oct 24, 2026 15:15
```

推荐桌面端使用 2 columns List，移动端改 1 column。

---

## 9. Edit Profile Interaction

点击：

```txt
Save Changes
```

流程：

1. Validate
2. Button loading
3. API request
4. Success message
5. 更新 Summary

Cancel：

- reset fields
- 若有修改，弹确认

---

## 10. Responsive

Desktop：

```txt
Main area = 2 : 1
```

Tablet：

```txt
Main area = 1 column
```

Mobile：

- Summary 垂直布局
- Metrics 2 × 2
- Form 单列
- Avatar Upload 单列

---

## 11. 推荐组件

```txt
PageContainer
ProCard
ProForm
ProFormText
ProFormSelect
ProFormTextArea
Avatar
Badge
Tag
Progress
Upload
Select
List
Timeline
Button
message
```
