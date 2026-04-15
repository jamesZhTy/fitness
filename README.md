# 燃动健身 (FitLife)

一款全功能健身应用，帮助用户制定训练计划、记录打卡、加入社区互动。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React Native (Expo 54) + TypeScript |
| 后端 | NestJS + TypeORM + PostgreSQL |
| 状态管理 | Zustand |
| 路由 | Expo Router (文件路由) |
| 认证 | JWT (Access Token + Refresh Token) |

## 功能模块

- **训练** — 5 大分类（跑步、瑜伽、力量、拉伸、HIIT），每个分类含入门/进阶/高级计划，支持实时训练倒计时
- **打卡** — 月历视图、心情记录、运动时长/卡路里统计，支持连续打卡追踪
- **社区** — 发帖/点赞/评论、团队创建与管理、挑战赛与排行榜
- **个人中心** — 用户信息、训练提醒设置、登出

## 项目结构

```
fitness/
├── mobile/          # React Native 前端 (Expo)
│   └── src/
│       ├── app/     # 页面路由 (Expo Router)
│       ├── services/# API 服务层
│       ├── stores/  # Zustand 状态管理
│       └── types/   # TypeScript 类型定义
└── server/          # NestJS 后端
    └── src/
        ├── modules/ # 业务模块 (auth, user, workout, checkin, post, team, challenge, reminder)
        ├── database/# 数据库配置
        └── common/  # 公共过滤器、拦截器
```

## 快速启动

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14
- Expo CLI

### 后端

```bash
cd server
npm install
# 配置数据库连接 (src/database/database.module.ts)
npm run start:dev
```

服务启动后自动创建数据表并填充种子数据（15 个训练计划、5 个挑战赛）。

### 前端

```bash
cd mobile
npm install
npm run start       # Expo Dev Server
npm run android     # Android
npm run ios         # iOS
npm run web         # Web 浏览器
```

## 设计风格

暗色主题 + 珊瑚橙渐变，打造高端运动感：

- 背景：深炭灰 `#1A1A2E`
- 主色：珊瑚橙 `#FF6B6B`
- 强调色：暖橙 `#FF8E53`
- 成功色：翠绿 `#00E676`

## API 概览

| 模块 | 端点 | 说明 |
|------|------|------|
| 认证 | `POST /auth/register` | 注册 |
| | `POST /auth/login` | 登录 |
| | `POST /auth/refresh` | 刷新 Token |
| 用户 | `GET /users/profile` | 获取个人信息 |
| 训练 | `GET /workouts/categories` | 训练分类列表 |
| | `GET /workouts/categories/:id/plans` | 分类下的计划 |
| | `GET /workouts/plans/:id` | 计划详情（含动作） |
| 打卡 | `POST /checkins` | 创建打卡 |
| | `GET /checkins` | 打卡记录 |
| 社区 | `GET /posts` | 帖子列表 |
| | `POST /posts` | 发帖 |
| 团队 | `GET /teams` | 团队列表 |
| 挑战 | `GET /challenges` | 挑战列表 |
| 提醒 | `GET /reminders` | 提醒列表 |
