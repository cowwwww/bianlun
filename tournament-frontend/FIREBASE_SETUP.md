# Tournament Management System - Firebase 数据库设计

## 📋 概述

本文档描述了云赛Tournament Management System的Firebase Firestore数据库结构。系统包含主办方模式，支付订阅，AI功能使用统计等功能。

## 🗂️ Collections 结构

### 1. `organizations` - 主办方组织信息

```javascript
{
  id: "org_123",
  name: "北京体育赛事公司",
  email: "contact@example.com",
  phone: "+86 138-0000-0000",
  address: "北京市朝阳区...",
  logo: "https://firebasestorage.googleapis.com/...",
  website: "https://example.com",
  description: "专业体育赛事组织机构",
  verificationStatus: "verified", // verified, pending, rejected
  rating: 4.8,
  totalTournaments: 25,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  settings: {
    timezone: "Asia/Shanghai",
    defaultLanguage: "zh-CN",
    emailNotifications: true,
    smsNotifications: false
  }
}
```

### 2. `users` - 用户信息

```javascript
{
  id: "user_123",
  email: "user@example.com",
  displayName: "张三",
  photoURL: "https://...",
  phoneNumber: "+86 138-0000-0000",
  role: "organizer", // organizer, participant, judge, admin
  organizationId: "org_123", // 如果是主办方用户
  subscription: {
    planId: "professional",
    status: "active",
    startDate: Timestamp,
    endDate: Timestamp,
    autoRenew: true
  },
  aiUsage: {
    totalUsed: 45,
    monthlyUsed: 15,
    lastResetDate: Timestamp,
    remainingQuota: 55
  },
  preferences: {
    language: "zh-CN",
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  },
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

### 3. `subscriptionPlans` - 订阅计划

```javascript
{
  id: "professional",
  name: "专业版",
  description: "适合专业赛事组织的完整功能",
  price: 299,
  currency: "CNY",
  billingCycle: "monthly", // monthly, yearly
  features: [
    "unlimited_tournaments",
    "ai_assistance_100",
    "advanced_analytics",
    "priority_support"
  ],
  limits: {
    tournaments: -1, // -1 表示无限
    participants: 1000,
    aiUsage: 100,
    storage: 10 // GB
  },
  isActive: true,
  sortOrder: 2,
  createdAt: Timestamp
}
```

### 4. `subscriptions` - 用户订阅记录

```javascript
{
  id: "sub_123",
  userId: "user_123",
  planId: "professional",
  status: "active", // active, canceled, expired, trial
  startDate: Timestamp,
  endDate: Timestamp,
  autoRenew: true,
  paymentMethod: "wechat_pay",
  trialUsed: false,
  cancelReason: null,
  canceledAt: null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. `payments` - 支付记录

```javascript
{
  id: "pay_123",
  userId: "user_123",
  subscriptionId: "sub_123",
  amount: 299,
  currency: "CNY",
  status: "completed", // pending, completed, failed, refunded
  paymentMethod: "wechat_pay", // wechat_pay, alipay, stripe
  transactionId: "wx20240315001",
  description: "专业版月费 - 2024年3月",
  metadata: {
    planName: "专业版",
    billingPeriod: "2024-03-01 to 2024-04-01"
  },
  refundAmount: 0,
  refundReason: null,
  createdAt: Timestamp,
  completedAt: Timestamp
}
```

### 6. `tournaments` - 赛事信息

```javascript
{
  id: "tournament_123",
  organizerId: "user_123",
  organizationId: "org_123",
  name: "2024年春季羽毛球公开赛",
  description: "面向全国的羽毛球竞技赛事",
  sport: "badminton",
  format: "single_elimination", // single_elimination, double_elimination, round_robin, swiss
  status: "registration_open", // draft, registration_open, in_progress, completed, canceled
  
  // 基本信息
  startDate: Timestamp,
  endDate: Timestamp,
  registrationStartDate: Timestamp,
  registrationEndDate: Timestamp,
  venue: {
    name: "北京奥体中心",
    address: "北京市朝阳区...",
    coordinates: {
      latitude: 39.904200,
      longitude: 116.407396
    }
  },
  
  // 参赛设置
  maxParticipants: 64,
  currentParticipants: 32,
  entryFee: 200,
  currency: "CNY",
  ageRestrictions: {
    minAge: 16,
    maxAge: null
  },
  
  // 赛事规则
  rules: {
    gameFormat: "best_of_3",
    pointsToWin: 21,
    servingRules: "rally_point"
  },
  
  // 联系信息
  contact: {
    name: "张主办",
    email: "organizer@example.com",
    phone: "+86 138-0000-0000"
  },
  
  // 文档链接
  documents: {
    rulebook: "https://...",
    registrationForm: "https://...",
    schedule: "https://..."
  },
  
  // 统计信息
  stats: {
    totalMatches: 63,
    completedMatches: 45,
    viewCount: 1250,
    registrationCount: 32
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. `registrations` - 报名信息

```javascript
{
  id: "reg_123",
  tournamentId: "tournament_123",
  participantId: "user_456",
  
  // 参赛者信息
  participantInfo: {
    name: "李四",
    email: "lisi@example.com",
    phone: "+86 139-0000-0000",
    dateOfBirth: Timestamp,
    gender: "male",
    nationality: "CN",
    idNumber: "110101199001011234",
    
    // 体育信息
    experience: "校队主力，参加过多次比赛",
    ranking: null,
    clubAffiliation: "北京大学羽毛球队",
    
    // 紧急联系人
    emergencyContact: {
      name: "李父",
      relationship: "父亲",
      phone: "+86 139-0000-0001"
    }
  },
  
  // 报名状态
  status: "approved", // pending, approved, rejected, withdrawn
  paymentStatus: "paid", // pending, paid, failed, refunded
  registrationDate: Timestamp,
  approvalDate: Timestamp,
  
  // 分组信息
  category: "男子单打",
  seedNumber: null,
  
  // 文档
  documents: [
    {
      type: "id_photo",
      url: "https://...",
      uploadedAt: Timestamp
    }
  ],
  
  // 备注
  notes: "特殊饮食要求：素食",
  organizerNotes: "审核通过",
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 8. `matches` - 比赛场次

```javascript
{
  id: "match_123",
  tournamentId: "tournament_123",
  
  // 轮次信息
  roundNumber: 1,
  roundName: "第一轮",
  matchNumber: 1,
  
  // 参赛者
  participant1Id: "reg_123",
  participant2Id: "reg_124",
  participant1: {
    name: "张三",
    seed: 1,
    avatar: "https://..."
  },
  participant2: {
    name: "李四",
    seed: 8,
    avatar: "https://..."
  },
  
  // 比赛结果
  status: "completed", // pending, in_progress, completed, walkover, no_show
  winnerId: "reg_123",
  score: {
    sets: [
      { player1: 21, player2: 15 },
      { player1: 21, player2: 18 }
    ],
    totalSets: "2-0"
  },
  
  // 时间安排
  scheduledTime: Timestamp,
  startTime: Timestamp,
  endTime: Timestamp,
  estimatedDuration: 45, // 分钟
  
  // 场地信息
  venue: {
    court: "1号场地",
    location: "主馆",
    equipment: ["羽毛球", "记分牌"]
  },
  
  // 下一轮比赛
  nextMatchId: "match_456",
  
  // 比赛记录
  gameLog: [
    {
      timestamp: Timestamp,
      action: "point_scored",
      player: "participant1",
      score: { player1: 1, player2: 0 }
    }
  ],
  
  // 裁判信息
  referee: {
    id: "judge_123",
    name: "王裁判"
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 9. `brackets` - 签表信息

```javascript
{
  id: "bracket_123",
  tournamentId: "tournament_123",
  type: "main_draw", // main_draw, qualification, consolation
  format: "single_elimination",
  
  // 签表结构
  structure: {
    rounds: [
      {
        roundNumber: 1,
        roundName: "第一轮",
        matches: ["match_1", "match_2", "match_3", "match_4"]
      },
      {
        roundNumber: 2,
        roundName: "半决赛",
        matches: ["match_5", "match_6"]
      },
      {
        roundNumber: 3,
        roundName: "决赛",
        matches: ["match_7"]
      }
    ]
  },
  
  // 种子排列
  seeding: [
    { position: 1, participantId: "reg_123", seed: 1 },
    { position: 2, participantId: "reg_124", seed: 8 }
  ],
  
  // 统计信息
  totalParticipants: 8,
  totalMatches: 7,
  completedMatches: 5,
  
  generatedAt: Timestamp,
  lastUpdated: Timestamp
}
```

### 10. `aiUsageLogs` - AI使用记录

```javascript
{
  id: "ai_log_123",
  userId: "user_123",
  feature: "bracket_generation", // bracket_generation, data_analysis, schedule_optimization, etc.
  input: {
    participants: 32,
    format: "single_elimination",
    parameters: {...}
  },
  output: {
    success: true,
    executionTime: 1.2, // 秒
    result: {...}
  },
  tokensUsed: 1,
  timestamp: Timestamp,
  
  // 成本计算
  cost: {
    credits: 1,
    estimatedPrice: 0.01 // CNY
  }
}
```

### 11. `notifications` - 通知消息

```javascript
{
  id: "notif_123",
  userId: "user_123",
  type: "tournament_update", // registration_approved, match_scheduled, payment_success, etc.
  title: "比赛安排通知",
  message: "您的比赛安排在明天上午9:00，1号场地",
  data: {
    tournamentId: "tournament_123",
    matchId: "match_123"
  },
  
  // 状态
  read: false,
  delivered: true,
  
  // 发送渠道
  channels: {
    push: true,
    email: false,
    sms: false
  },
  
  // 优先级
  priority: "normal", // low, normal, high, urgent
  
  createdAt: Timestamp,
  readAt: null
}
```

## 🔧 Firebase 配置

### Firestore 安全规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 主办方可以管理自己的赛事
    match /tournaments/{tournamentId} {
      allow read: if true; // 公开可读
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.organizerId || 
         hasRole('admin'));
    }
    
    // 报名信息访问控制
    match /registrations/{registrationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.participantId || 
         request.auth.uid == getTournamentOrganizer(resource.data.tournamentId));
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == getTournamentOrganizer(resource.data.tournamentId);
    }
    
    // 订阅和支付记录只能由用户自己访问
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /payments/{paymentId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // AI使用记录
    match /aiUsageLogs/{logId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // 辅助函数
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function getTournamentOrganizer(tournamentId) {
      return get(/databases/$(database)/documents/tournaments/$(tournamentId)).data.organizerId;
    }
  }
}
```

### 索引配置

需要在Firebase Console中创建以下复合索引：

```javascript
// tournaments collection
{
  "collectionGroup": "tournaments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "organizerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// registrations collection
{
  "collectionGroup": "registrations",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tournamentId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "registrationDate", "order": "DESCENDING" }
  ]
}

// matches collection
{
  "collectionGroup": "matches",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tournamentId", "order": "ASCENDING" },
    { "fieldPath": "roundNumber", "order": "ASCENDING" },
    { "fieldPath": "matchNumber", "order": "ASCENDING" }
  ]
}

// aiUsageLogs collection
{
  "collectionGroup": "aiUsageLogs",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

## 📱 Firebase Storage 结构

```
/tournament-files/
  /{tournamentId}/
    /documents/
      /rulebook.pdf
      /schedule.xlsx
    /images/
      /banner.jpg
      /logo.png

/user-uploads/
  /{userId}/
    /avatar.jpg
    /documents/
      /id_card.jpg
      /certificate.pdf

/organization-files/
  /{organizationId}/
    /logo.jpg
    /verification_docs/
      /business_license.pdf
```

## 🔐 认证配置

启用以下认证提供商：
- Email/Password
- Google
- 微信 (需要配置)
- 支付宝 (需要配置)

## 📊 分析配置

启用 Firebase Analytics 跟踪：
- 用户注册
- 赛事创建
- 订阅购买
- AI功能使用
- 页面浏览

## 🚀 部署步骤

1. 创建 Firebase 项目
2. 启用 Firestore Database
3. 启用 Authentication
4. 启用 Storage
5. 配置安全规则
6. 创建索引
7. 配置环境变量
8. 部署应用

## 📋 环境变量

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=sender_id
REACT_APP_FIREBASE_APP_ID=app_id

# 支付配置
REACT_APP_WECHAT_PAY_APP_ID=wx_app_id
REACT_APP_ALIPAY_APP_ID=alipay_app_id
```

## 🔄 数据迁移

如果需要从现有系统迁移数据，建议使用Firebase Admin SDK编写迁移脚本。

## 📈 性能优化

1. 使用Firestore离线持久化
2. 实施数据分页
3. 优化查询使用索引
4. 使用Firebase Functions处理后台任务
5. 启用CDN缓存静态资源

## 🛡️ 安全建议

1. 定期审查安全规则
2. 使用强密码策略
3. 启用多因素认证
4. 监控异常访问
5. 定期备份数据

这个数据库设计支持完整的Tournament Management System功能，包括订阅管理、AI使用跟踪、实时比赛更新等高级特性。 