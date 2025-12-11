# 🏸 云赛 Tournament Management System

一个完整的赛事管理系统，类似于BWF、Tennis Australia等专业赛事管理平台，为主办方提供从报名收集到赛果管理的一站式解决方案。

## 🌟 系统特色

### 💎 主办方订阅模式
- **分层订阅计划**：基础版/专业版/企业版
- **AI功能配额**：智能签表生成、数据分析、赛程优化
- **灵活支付**：支持微信支付、支付宝等主流支付方式
- **自动续费管理**：订阅状态跟踪和自动续费

### 🤖 AI智能助手
- **智能签表生成**：根据参赛者实力自动分组
- **赛程优化**：考虑场地、时间的智能排程
- **数据分析**：比赛数据深度分析和预测
- **使用统计**：详细的AI功能使用记录和配额管理

### 📝 完整报名管理
- **可视化表单设计器**：拖拽式自定义报名表
- **智能审核流程**：自动/手动审核机制
- **支付状态跟踪**：实时监控报名费支付情况
- **批量操作**：一键导出、批量审核、消息通知

### 🏆 专业签表系统
- **多种赛制支持**：单败淘汰、双败淘汰、循环赛、瑞士制
- **可视化签表**：直观的对战图展示
- **实时更新**：比赛结果实时同步到下一轮
- **种子排列**：支持手动/自动种子设置

### 📊 数据分析中心
- **实时统计**：参赛人数、比赛进度、收入统计
- **趋势分析**：参赛者增长、区域分布、年龄结构
- **性能指标**：比赛效率、场地利用率分析
- **导出功能**：支持Excel、PDF格式导出

## 🏗️ 技术架构

### 前端技术栈
```
React 18 + TypeScript
├── Material-UI (MUI) 5.x - UI组件库
├── React Router 6 - 路由管理
├── Firebase SDK - 后端服务
├── Chart.js - 数据可视化
└── PWA支持 - 移动端优化
```

### 后端服务
```
Firebase Platform
├── Firestore Database - NoSQL数据库
├── Authentication - 用户认证
├── Cloud Storage - 文件存储
├── Cloud Functions - 服务端逻辑
├── Analytics - 用户行为分析
└── Hosting - 静态网站托管
```

### 核心功能模块
```
Tournament Manager
├── Dashboard - 管理面板
├── Registration Management - 报名管理
├── Tournament Bracket - 赛程签表
├── Schedule Management - 赛程安排
├── Data Analytics - 数据分析
├── Payment Management - 支付管理
├── Subscription Management - 订阅管理
└── System Settings - 系统设置
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 8+ 或 yarn 1.22+
- Firebase CLI

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-repo/tournament-manager.git
cd tournament-manager/tournament-frontend
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置Firebase**
```bash
# 创建 .env 文件
cp .env.example .env

# 配置Firebase项目信息
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
# ... 其他配置
```

4. **启动开发服务器**
```bash
npm start
# 或
yarn start
```

5. **访问应用**
```
http://localhost:3000
```

## 📁 项目结构

```
tournament-frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   ├── OrganizerDashboard.tsx        # 管理面板
│   │   ├── RegistrationManagement.tsx    # 报名管理
│   │   ├── TournamentBracket.tsx         # 赛程签表
│   │   ├── SubscriptionManagement.tsx    # 订阅管理
│   │   └── TournamentManager.tsx         # 主路由
│   ├── firebase.ts        # Firebase配置
│   ├── App.tsx           # 应用主组件
│   └── index.tsx         # 应用入口
├── FIREBASE_SETUP.md      # Firebase配置文档
└── package.json
```

## 🎯 核心功能详解

### 1. 主办方管理面板
- **赛事概览**：实时显示所有赛事状态
- **关键指标**：报名数、收入、参赛者统计
- **快速操作**：一键创建赛事、发布公告
- **AI使用统计**：当月AI功能使用情况

### 2. 报名管理系统
- **表单设计器**：
  - 拖拽式字段添加
  - 10+种字段类型
  - 实时预览功能
  - 字段验证规则

- **报名审核**：
  - 批量审核操作
  - 状态筛选过滤
  - 详细信息查看
  - 自动通知发送

### 3. 赛程签表管理
- **签表生成**：
  - 支持4种赛制
  - 智能种子排列
  - 自动赛程安排
  - 场地分配优化

- **比赛管理**：
  - 实时比分录入
  - 自动晋级更新
  - 比赛状态跟踪
  - 结果统计分析

### 4. 订阅计划管理
- **三层订阅体系**：
  - 基础版：¥99/月（3个赛事，10次AI）
  - 专业版：¥299/月（无限赛事，100次AI）
  - 企业版：¥999/月（无限制，500次AI）

- **AI功能配额**：
  - 使用量实时统计
  - 配额用完自动限制
  - 升级提醒机制
  - 详细使用历史

## 💳 支付集成

### 支持的支付方式
- 微信支付
- 支付宝
- 银联在线
- PayPal（海外用户）

### 支付流程
1. 选择订阅计划
2. 确认订单信息
3. 选择支付方式
4. 完成支付验证
5. 自动开通服务

### 自动续费
- 到期前3天提醒
- 自动扣费并延期
- 支付失败重试机制
- 人工客服支持

## 🔧 Firebase配置指南

### 必需的Firebase服务
1. **Firestore Database**
   - 存储所有业务数据
   - 实时数据同步
   - 离线支持

2. **Authentication**
   - 用户登录认证
   - 多种登录方式
   - 会话管理

3. **Cloud Storage**
   - 文件上传存储
   - CDN加速
   - 权限控制

4. **Cloud Functions**
   - 支付回调处理
   - 定时任务执行
   - 数据处理逻辑

### 数据库集合结构
详见 `FIREBASE_SETUP.md` 文档

## 🌐 部署指南

### 开发环境部署
```bash
# 启动开发服务器
npm run dev

# 构建开发版本
npm run build:dev
```

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 部署到Firebase Hosting
firebase deploy
```

### 环境变量配置
```env
# Firebase配置
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# 支付配置
REACT_APP_WECHAT_PAY_APP_ID=
REACT_APP_ALIPAY_APP_ID=

# API配置
REACT_APP_API_BASE_URL=
REACT_APP_AI_SERVICE_URL=
```

## 📊 监控和分析

### Firebase Analytics集成
- 用户行为跟踪
- 页面访问统计
- 转化率分析
- 自定义事件监控

### 关键指标监控
- 用户注册转化率
- 订阅购买转化率
- AI功能使用率
- 系统性能指标

## 🔒 安全性

### 数据安全
- Firestore安全规则
- 用户权限控制
- 数据加密传输
- 敏感信息脱敏

### 支付安全
- PCI DSS合规
- 支付数据加密
- 交易记录审计
- 风险控制机制

## 🐛 测试策略

### 单元测试
```bash
# 运行单元测试
npm run test

# 测试覆盖率
npm run test:coverage
```

### 集成测试
- Firebase模拟器测试
- 支付流程测试
- 端到端测试

## 📈 性能优化

### 前端优化
- 代码分割和懒加载
- 图片压缩和WebP格式
- 缓存策略优化
- PWA离线支持

### 后端优化
- Firestore查询优化
- 数据索引配置
- Cloud Functions冷启动优化
- CDN内容分发

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建特性分支
3. 提交变更
4. 创建Pull Request
5. 代码审查

### 代码规范
- TypeScript严格模式
- ESLint + Prettier
- 组件命名规范
- 提交信息规范

## 📞 技术支持

### 联系方式
- 邮箱：support@tournament.com
- 微信群：扫码加入技术交流群
- 文档：https://docs.tournament.com
- Issue：GitHub Issues

### 常见问题
1. **Firebase配置问题**
   - 检查API密钥配置
   - 确认项目权限设置
   - 验证域名白名单

2. **支付集成问题**
   - 确认商户号配置
   - 检查回调URL设置
   - 验证签名算法

3. **性能问题**
   - 检查网络连接
   - 清除浏览器缓存
   - 优化查询条件

## 🗓️ 更新日志

### v2.0.0 (2024-03-15)
- ✨ 新增主办方订阅模式
- 🤖 集成AI智能助手
- 💳 完善支付系统
- 📊 优化数据分析
- 🎨 全新UI设计

### v1.5.0 (2024-02-01)
- 📝 报名表设计器
- 🏆 签表管理系统
- 📱 移动端适配
- 🔧 性能优化

## 📜 许可证

MIT License - 详见 LICENSE 文件

---

**云赛Tournament Management System** - 让赛事管理更智能、更高效！

🚀 [立即体验](https://tournament.example.com) | 📖 [查看文档](https://docs.tournament.com) | 💬 [加入社区](https://community.tournament.com) 