# 登录（Login）

> 页面类型：身份认证
> 推荐组件：ProComponents `LoginFormPage`（双栏）、`LoginForm`、`Checkbox`
> 截图：`../login.png`

---

## 1. 页面目标

品牌化的登录入口：左侧传递品牌信任感，右侧保持极简表单。

---

## 2. 页面结构（LoginFormPage 双栏）

```txt
LoginFormPage
├── 左侧品牌区（约 55% 宽）
│   ├── Logo（64px 高，logo-symbol.svg）
│   ├── 标题：Petpallets Admin（30px / 700 / -0.02em）
│   ├── 副文案：Wholesale catalog, inquiries and fulfillment — one precise console.
│   └── 引用块："Data over decoration."（左侧 2px 半透明白边线）
└── 右侧表单区
    ├── 标题：欢迎回来（22px / 700）
    ├── 副标题：使用管理员账号登录控制台
    ├── 邮箱 / 用户名（Input，40px 高）
    ├── 密码（Input.Password + 显示切换）
    ├── 自动登录 ☑ | 忘记密码？（主色文字链）
    ├── 登 录（primary，通栏 40px）
    └── 页脚：© 2026 Petpallets · 仅限授权人员访问 · 登录行为将被审计
```

---

## 3. 品牌区样式

```css
background: linear-gradient(160deg, #45B095 0%, #286B5B 100%);
color: #FFFFFF;
```

- 副文案：`rgba(255,255,255,.72)`
- 引用块：`rgba(255,255,255,.55)`，左边线 `rgba(255,255,255,.3)`
- Logo 使用白色描边版本或原图（薄荷绿在渐变上对比充足）

---

## 4. 表单规范

- 输入框高度 40px，边框 `--n200`，focus ring `--primary-300`
- 校验失败：边框 `--error` + 表单下方错误文案
- 登录中：按钮 loading，禁止重复提交
- 第三方登录预留位（当前不启用）

---

## 5. 安全提示

页脚固定显示审计提示；连续失败 5 次锁定并提示联系管理员（错误信息不暴露后端堆栈）。
