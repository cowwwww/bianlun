# 📝 添加微信字段 - 超简单指南

## ✅ 我已经为你创建了自动化脚本！

有两个方法，选一个最简单的：

---

## 🚀 方法1：自动添加（推荐）

### 步骤1: 停止 PocketBase
在运行PocketBase的终端按 **Ctrl+C** 停止它

### 步骤2: 重新启动
```bash
cd pocketbase
./pocketbase serve
```

**✨ 就这样！** PocketBase会自动检测并应用migration，添加这3个字段！

你会看到：
```
> Applying migrations...
> Applied 1734000000_add_wechat_fields.js ✅
```

---

## 🖱️ 方法2：手动添加（更直观）

如果自动方式不行，手动添加也很简单：

### 1. 打开 PocketBase Admin
```
http://127.0.0.1:8090/_/
```

### 2. 找到 users 集合
点击左侧的 **users**

### 3. 点击 Fields 标签
在顶部找到并点击 **Fields**

### 4. 添加第一个字段
点击 **+ New field** 按钮

```
Field type: Text
Name: wechatOpenid
✅ 勾选 Unique (唯一约束)
```
点击 **Create**

### 5. 添加第二个字段
再次点击 **+ New field**

```
Field type: Text
Name: wechatUnionid
(不需要勾选Unique)
```
点击 **Create**

### 6. 添加第三个字段
再次点击 **+ New field**

```
Field type: URL
Name: avatar
(不需要勾选Unique)
```
点击 **Create**

### 7. 保存
点击右上角的 **Save changes** 按钮

---

## ✅ 验证是否成功

运行测试命令：
```bash
curl "http://127.0.0.1:8090/api/collections/users/records?perPage=1" 2>/dev/null | grep -o "wechatOpenid"
```

如果显示 `wechatOpenid` 说明添加成功！✅

或者在 Admin 界面查看 users 集合的 Fields，应该能看到：
- ✅ wechatOpenid (Text, Unique)
- ✅ wechatUnionid (Text)
- ✅ avatar (URL)

---

## 🎯 完成后

字段添加成功后，你就可以：

1. **启动前端**:
   ```bash
   cd tournament-frontend
   npm run dev
   ```

2. **测试微信登录**:
   ```
   http://localhost:5173/login
   点击 "🎯 使用微信登录"
   ```

3. **PC扫码** 或 **手机微信内打开** 都可以！

---

## 📸 参考图解

### 添加字段界面：
```
┌─────────────────────────────────────┐
│  users Collection                   │
├─────────────────────────────────────┤
│  [Records] [Fields] [API Rules]    │ ← 点击 Fields
├─────────────────────────────────────┤
│                                     │
│  📝 Fields                          │
│  ┌───────────────────────────────┐ │
│  │ + New field                   │ │ ← 点击这里
│  └───────────────────────────────┘ │
│                                     │
│  📋 Existing fields:                │
│  - id (Primary)                     │
│  - email                            │
│  - name                             │
│  + wechatOpenid ✨ (新添加)         │
│  + wechatUnionid ✨ (新添加)        │
│  + avatar ✨ (新添加)                │
│                                     │
└─────────────────────────────────────┘
```

---

## 🆘 遇到问题？

### 问题1: 找不到 users 集合
**解决**: 在左侧菜单找 "Collections"，点开应该能看到 users

### 问题2: 没有 "+ New field" 按钮
**解决**: 确保点击了 "Fields" 标签，不是 "Records"

### 问题3: 保存时报错
**解决**: 
- 检查 wechatOpenid 是否勾选了 Unique
- 字段名称大小写要完全一致
- 刷新页面重试

---

## ⏱️ 大概需要时间

- 自动方式：30秒（重启PocketBase）
- 手动方式：2分钟（点点点）

**选择你觉得最舒服的方式！** 😊

