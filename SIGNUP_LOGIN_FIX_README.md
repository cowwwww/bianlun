# 🔧 注册和登录问题修复指南

## 问题描述

当用户尝试注册时，收到以下错误：

```
ClientResponseError 403: Only admins can perform this action.
```

## 根本原因

PocketBase Users 集合的 **API Rules** 设置过于严格，不允许未认证用户创建新账户。

---

## 🚀 快速修复步骤

### 方法 1: 通过管理界面修复（推荐）

1. **打开修复指南**
   ```bash
   # 在浏览器中打开
   open fix-users-api-rules.html
   ```

2. **按照指南操作**
   - 打开 PocketBase 管理后台
   - 进入 Collections → users → API Rules
   - 将 **Create** 规则设置为**空**（完全删除任何文本）
   - 保存更改

3. **测试注册功能**
   ```bash
   # 在浏览器中打开测试工具
   open test-signup-after-fix.html
   ```

---

### 方法 2: 通过命令行修复

如果您熟悉命令行，可以直接修改 PocketBase 数据库：

```bash
# 1. 停止 PocketBase
# (按 Ctrl+C 停止运行的 PocketBase 进程)

# 2. 备份数据库
cp pocketbase/pb_data/data.db pocketbase/pb_data/data.db.backup

# 3. 使用 SQLite 修改 API 规则
sqlite3 pocketbase/pb_data/data.db <<EOF
UPDATE _collections 
SET listRule = '@request.auth.id != ""',
    viewRule = '@request.auth.id != ""',
    createRule = '',
    updateRule = '@request.auth.id = id',
    deleteRule = '@request.auth.id = id'
WHERE name = 'users';
EOF

# 4. 重启 PocketBase
cd pocketbase
./pocketbase serve
```

---

### 方法 3: 重新创建 Users 集合（仅在必要时）

如果以上方法都不起作用，可以重新创建 Users 集合：

```bash
# 在浏览器中打开
open setup-users-collection.html
```

按照指南重新设置 Users 集合。

---

## ✅ 正确的 API Rules 配置

Users 集合应该使用以下 API Rules：

| 操作 | 规则表达式 | 说明 |
|------|-----------|------|
| **List/Search** | `@request.auth.id != ""` | 只有已登录用户可以列出用户 |
| **View** | `@request.auth.id != ""` | 只有已登录用户可以查看用户详情 |
| **Create** | `留空` 或 `""` | ⚠️ **关键！** 允许任何人注册 |
| **Update** | `@request.auth.id = id` | 用户只能更新自己的资料 |
| **Delete** | `@request.auth.id = id` | 用户只能删除自己的账号 |

### 为什么 Create 规则要留空？

注册时，用户还**没有登录**，所以必须允许未认证的请求创建用户记录。这是标准的用户注册模式。

---

## 🧪 验证修复

修复后，使用以下方法验证：

### 1. 使用测试工具

```bash
# 打开测试工具
open test-signup-after-fix.html
```

填写表单并点击"测试注册"，查看日志输出。

### 2. 使用前端应用

```bash
# 启动前端（如果未运行）
cd tournament-frontend
npm run dev

# 在浏览器中打开
# http://localhost:5173/signup
```

尝试注册一个测试账号：
- 姓名：测试用户
- 微信号：test_user_001
- 密码：123456
- 确认密码：123456

### 3. 检查控制台

在浏览器中按 `F12` 打开开发者工具，查看控制台输出：

✅ **成功的输出：**
```
User signed up successfully
```

❌ **失败的输出：**
```
Sign up error: ClientResponseError 403: Only admins can perform this action.
```

---

## 🔍 故障排查

### 问题 1: 修改后仍然显示 403 错误

**可能原因：**
- Create 规则没有真正保存
- Create 规则不是完全为空（可能有空格）
- 浏览器缓存了旧的错误

**解决方案：**
1. 重新打开 PocketBase 管理后台
2. 确认 Create 规则确实为空
3. 清除浏览器缓存（Ctrl+Shift+Delete）
4. 强制刷新前端页面（Ctrl+F5）

### 问题 2: 显示 400 错误（字段验证失败）

**可能原因：**
- 微信号格式不正确
- 微信号已被使用
- 必填字段缺失

**解决方案：**
1. 确保微信号符合格式：6-20位，字母开头，可包含字母、数字、下划线、减号
2. 尝试使用不同的微信号
3. 检查所有必填字段都已填写

### 问题 3: 集合类型不是 Auth Collection

**检查方法：**
1. 打开 PocketBase 管理后台
2. 进入 Collections → users
3. 查看集合类型

**如果不是 Auth Collection：**
1. 需要确保集合有以下字段：
   - `username` (Text, Unique)
   - `email` (Email, Unique)
   - `password` (Password)
   - `full_name` (Text)
   - `wechat_id` (Text)

2. 或者重新创建为 Auth Collection 类型

### 问题 4: PocketBase 无法连接

**检查：**
```bash
# 测试连接
curl http://127.0.0.1:8090/api/health

# 应该返回: {"code":200,"message":"API is healthy.","data":{}}
```

**如果无法连接：**
```bash
# 重启 PocketBase
cd pocketbase
./pocketbase serve
```

---

## 📝 代码检查

### AuthService.ts 是否正确

检查 `tournament-frontend/src/services/authService.ts` 中的 signUp 方法：

```typescript
async signUp(wechatId: string, password: string, fullName: string): Promise<User> {
  try {
    // ✅ 正确：使用 pb.collection('users').create()
    const user = await pb.collection('users').create({
      username: wechatId,
      email: wechatId, // 或者 `${wechatId}@wechat.user`
      password,
      passwordConfirm: password,
      full_name: fullName,
      wechat_id: wechatId
    });

    // 自动登录
    const authData = await pb.collection('users').authWithPassword(wechatId, password);
    
    return {
      id: authData.record.id,
      email: authData.record.wechat_id || wechatId,
      displayName: authData.record.full_name,
      name: authData.record.full_name,
      avatar: authData.record.avatar,
      subscriptionType: 'free'
    };
  } catch (error: any) {
    // 错误处理...
  }
}
```

### 如果需要修改

如果 email 字段格式有问题，可以修改为：

```typescript
email: `${wechatId}@wechat.user`, // 确保是有效的邮箱格式
```

---

## 📚 相关文档

- [fix-users-api-rules.html](./fix-users-api-rules.html) - 详细的修复指南
- [test-signup-after-fix.html](./test-signup-after-fix.html) - 测试工具
- [setup-users-collection.html](./setup-users-collection.html) - 集合设置指南

---

## 🆘 仍然需要帮助？

如果以上步骤都无法解决问题，请提供以下信息：

1. **PocketBase 版本**
   ```bash
   cd pocketbase
   ./pocketbase --version
   ```

2. **当前 API Rules 设置**
   - 截图 Users 集合的 API Rules 页面

3. **浏览器控制台完整错误**
   - F12 → Console → 复制完整错误信息

4. **网络请求详情**
   - F12 → Network → 找到失败的请求 → 复制 Headers 和 Response

---

## ✅ 修复完成检查清单

- [ ] PocketBase 正在运行（http://127.0.0.1:8090）
- [ ] Users 集合存在
- [ ] Create 规则为空（完全删除了所有文本）
- [ ] 其他 API Rules 已正确设置
- [ ] 保存了更改
- [ ] 测试工具可以成功注册
- [ ] 前端应用可以成功注册
- [ ] 可以使用新账号登录

---

## 📞 快速链接

- **PocketBase 管理后台**: http://127.0.0.1:8090/_/
- **前端应用**: http://localhost:5173
- **注册页面**: http://localhost:5173/signup
- **登录页面**: http://localhost:5173/login

---

**最后更新**: 2024年12月11日

