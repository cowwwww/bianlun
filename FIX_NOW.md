# 🚨 立即修复：注册和登录问题

## 问题
```
ClientResponseError 403: Only admins can perform this action.
```

## 一分钟快速修复

### 第 1 步：打开 PocketBase 管理后台

在浏览器中访问：
```
http://127.0.0.1:8090/_/
```

### 第 2 步：修改 API Rules

1. 点击左侧 **Collections**
2. 点击 **users** 集合
3. 点击顶部 **API Rules** 标签
4. 找到 **Create** 规则
5. **删除 Create 规则中的所有文本，使其完全为空**
6. 点击 **Save changes**

### 第 3 步：测试

在浏览器中打开：
```
http://localhost:5173/signup
```

尝试注册一个新账号。

---

## 📋 正确的 API Rules 设置

| 操作 | 规则 |
|------|------|
| List/Search | `@request.auth.id != ""` |
| View | `@request.auth.id != ""` |
| **Create** | **留空** ⚠️ |
| Update | `@request.auth.id = id` |
| Delete | `@request.auth.id = id` |

---

## 🔍 如果还是不行

### 选项 1：使用详细修复指南
```bash
open fix-users-api-rules.html
```

### 选项 2：使用测试工具
```bash
open test-signup-after-fix.html
```

### 选项 3：运行验证脚本
```bash
./verify-pocketbase-setup.sh
```

### 选项 4：查看完整文档
```bash
open SIGNUP_LOGIN_FIX_README.md
```

---

## ✅ 我还修复了什么

除了提供修复指南，我还：

1. **修复了 authService.ts 中的 email 格式**
   - 从 `email: wechatId` 
   - 改为 `email: ${wechatId}@wechat.user`
   - 这确保了 PocketBase 接收到有效的邮箱格式

2. **创建了多个工具帮助您**
   - `fix-users-api-rules.html` - 详细的修复指南
   - `test-signup-after-fix.html` - 测试工具
   - `verify-pocketbase-setup.sh` - 自动验证脚本
   - `SIGNUP_LOGIN_FIX_README.md` - 完整文档

---

## 🎯 现在就做这个

1. **打开管理后台** → http://127.0.0.1:8090/_/
2. **进入** Collections → users → API Rules
3. **清空** Create 规则
4. **保存** 更改
5. **测试** 注册功能

**就是这么简单！** 🎉

---

需要帮助？打开 `fix-users-api-rules.html` 查看详细说明。

