# 🔧 快速修复 404 错误

## 错误原因
```
GET http://127.0.0.1:8090/api/collections/tournaments/records 404 (Not Found)
```

**这个错误表示：PocketBase 中还没有创建 `tournaments` 集合！**

---

## ✅ 快速修复步骤（5分钟）

### 方法 1: 使用设置工具（推荐）

1. **打开设置工具**
   ```bash
   # 在浏览器中打开：
   file:///Users/mac/Downloads/bianluns(9.5:10)/setup-pocketbase-collections.html
   ```
   
2. **按照工具中的步骤操作**
   - 打开 PocketBase Admin
   - 创建所需集合
   - 添加示例数据

---

### 方法 2: 手动创建（详细步骤）

#### 步骤 1: 打开 PocketBase Admin
访问: **http://127.0.0.1:8090/_/**

如果是第一次：
- Email: `admin@example.com`
- Password: `admin123456`（或您自己设置的密码）

#### 步骤 2: 创建 `tournaments` 集合

1. 点击 **"New collection"**
2. 填写：
   - Name: `tournaments`
   - Type: **Base collection**
3. 点击 **"Create"**

4. 添加字段（点击 "+ New field"）：

| 字段名 | 类型 | 必填 |
|--------|------|------|
| name | Text | ✅ Yes |
| title | Text | No |
| description | Text | No |
| startDate | Text | No |
| endDate | Text | No |
| registrationDeadline | Text | No |
| date | Text | No |
| location | Text | No |
| type | Text | No |
| status | Text | No |
| price | Number | No |
| teamsize | Text | No |
| organizer | Text | No |
| contact | Text | No |
| category | Text | No |
| image | Text | No |
| totalTeams | Number | No |
| playersPerTeam | Number | No |
| participationRequirements | Text | No |
| registrationLink | Text | No |
| ruleBookLink | Text | No |
| award | Text | No |

5. 点击 **"Save"**

#### 步骤 3: 设置 API 权限

1. 点击集合，进入 **"API Rules"** 标签
2. 设置规则：
   - **List/Search rule**: 留空（公开访问）
   - **View rule**: 留空（公开访问）
   - **Create rule**: `@request.auth.id != ""`
   - **Update rule**: `@request.auth.id != ""`
   - **Delete rule**: `@request.auth.id != ""`
3. 点击 **"Save changes"**

#### 步骤 4: 添加示例数据（可选）

1. 在 tournaments 集合中，点击 **"New record"**
2. 填写：
   ```
   name: 2024全国辩论锦标赛
   title: 2024全国辩论锦标赛
   description: 全国最高水平的辩论比赛
   startDate: 2024-06-01
   endDate: 2024-06-03
   location: 北京市
   type: debate
   status: upcoming
   organizer: 中国辩论协会
   ```
3. 点击 **"Create"**

#### 步骤 5: 创建其他集合

重复以上步骤创建：

**`topics` 集合：**
- text (Text, required)
- explanation (Text)
- area (Text)
- language (Text)
- tournament (Text)
- ratings (JSON)
- averageRating (Number)

**`timer_projects` 集合：**
- name (Text, required)
- description (Text)
- type (Text, required)
- duration (Number)
- createdBy (Text, required)

---

## 🎯 验证修复

1. **刷新您的应用页面**: http://localhost:5173
2. **检查浏览器控制台** - 404 错误应该消失了
3. **应该能看到数据** - 如果添加了示例数据

---

## 🔍 仍然出错？

### 检查清单：

- [ ] PocketBase 正在运行
  ```bash
  # 在终端运行：
  cd /Users/mac/Downloads/bianluns\(9.5:10\)/pocketbase
  ./pocketbase serve
  ```

- [ ] 端口正确（8090）
  ```bash
  # 访问应该能打开：
  http://127.0.0.1:8090/_/
  ```

- [ ] 集合名称正确（小写，复数形式）
  - ✅ `tournaments`（正确）
  - ❌ `tournament`（错误）
  - ❌ `Tournaments`（错误）

- [ ] API 权限已设置
  - List/Search rule 不能是空的限制规则

---

## 📞 快速帮助

### 查看 PocketBase 日志
```bash
tail -f /Users/mac/Downloads/bianluns\(9.5:10\)/pocketbase/pocketbase.log
```

### 重启 PocketBase
```bash
# 按 Ctrl+C 停止当前运行
# 然后重新启动：
./pocketbase serve
```

### 清除浏览器缓存
1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

---

## ✅ 成功标志

修复成功后，您应该看到：
- ✅ 浏览器控制台没有 404 错误
- ✅ 首页显示赛事列表（或"还没有赛事"的空状态）
- ✅ 可以正常浏览应用

---

## 📝 后续步骤

1. 添加更多数据（在 Admin 面板或应用中）
2. 注册用户账号
3. 创建赛事
4. 使用计时器功能

**一切就绪！** 🎉

