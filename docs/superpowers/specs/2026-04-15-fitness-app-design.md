# FitLife - Fitness App Design Spec

## Overview

A mobile fitness app targeting beginners, focused on habit formation through diverse workout content, daily check-ins, reminders, and deep social features (teams, challenges, leaderboards).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + TypeScript + Expo |
| Navigation | React Navigation (Tab + Stack) |
| State Management | Zustand |
| Networking | Axios + React Query |
| Local Push | expo-notifications |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + TypeORM |
| Cache / Leaderboard | Redis (Sorted Sets) |
| Auth | JWT (access + refresh token) |
| File Storage | Local filesystem or S3-compatible storage |

## Architecture

Monolith architecture with NestJS modular design. Each business domain is a NestJS module, enabling clean code organization and future microservice extraction if needed.

```
React Native App
    |
NestJS API Server (Monolith)
    ├── AuthModule
    ├── UserModule
    ├── WorkoutModule
    ├── CheckInModule
    ├── NotificationModule
    ├── PostModule
    ├── TeamModule
    ├── ChallengeModule
    └── UploadModule
    |
PostgreSQL + Redis
```

## Data Model

### User
- id, email, passwordHash, username, avatar, bio
- height, weight, fitnessLevel (beginner/intermediate/advanced)
- createdAt, updatedAt
- deviceTokens[] (for push notifications)

### WorkoutCategory
- id, name (yoga/running/strength/stretching/HIIT...)
- icon, description, sortOrder

### WorkoutPlan
- id, categoryId, title, description
- difficulty (beginner/intermediate/advanced)
- duration (minutes), caloriesBurned
- phases[] -> WorkoutPhase

### WorkoutPhase
- id, planId, name (warmup/main training/cooldown)
- type (warmup / main / cooldown)
- sortOrder, duration
- exercises[] -> Exercise

### Exercise
- id, name, description
- sets, reps, duration
- videoUrl, imageUrl

### CheckIn
- id, userId, workoutPlanId
- date, duration, caloriesBurned
- mood, note
- photos[]

### Reminder
- id, userId
- time, repeatDays[] (Mon-Sun)
- isEnabled, message

### Post
- id, userId, content, images[]
- checkInId (optional, link to check-in)
- likesCount, commentsCount

### Comment
- id, postId, userId, content, createdAt

### Follow
- followerId, followingId

### Team
- id, name, captainId
- members[], maxMembers
- challenge -> Challenge

### Challenge
- id, title, description
- type (consecutive check-in / total workout time / team PK)
- startDate, endDate, goal
- participants[], leaderboard[]

## Feature Modules

### 1. Workout Module
- **Category browsing:** Home page displays workout categories (yoga/running/strength/stretching/HIIT), filterable by difficulty
- **Plan details:** Shows exercise list, instructional video/images, estimated duration and calories
- **Training mode:** Step-by-step exercise guidance with countdown/counter, pause/skip support
- **Training record:** Auto-generated record upon completion with duration, calories data

### 2. Check-in Module
- **Daily check-in:** Auto-generated after training completion, or manual check-in
- **Check-in calendar:** Monthly view showing check-in records, consecutive days highlighted
- **Check-in details:** Add training feedback, photos, notes
- **Statistics:** Weekly/monthly/yearly trend charts (duration, frequency, calories)

### 3. Notification Module
- **Custom reminders:** User sets daily training reminder time, selectable repeat days (e.g., Mon/Wed/Fri)
- **Local push:** React Native local notifications triggered at set time
- **Smart reminders:** Encouragement notifications when user misses consecutive days
- **Check-in reminders:** Reminder when trained but not checked in for the day

### 4. Social Module
- **Feed:** Following + recommended posts feed (recommendation: chronological sort with hot posts boosted by like/comment count)
- **Post creation:** Text + image posts, optionally linked to check-in records for one-tap sharing
- **Interactions:** Like, comment, follow/unfollow
- **Teams:** Create/join teams, team members work together toward challenge goals
- **Challenges:** System or user-created challenges ("30 consecutive check-in days", "5 hours of exercise this week")
- **Leaderboard:** Rankings by check-in days, workout duration, challenges completed. Daily/weekly/all-time boards

## Workout Phase Design

Each workout plan contains multiple phases for a complete training experience:

```
Example: "Beginner 30min Run"
├── Phase 1: Warm-up Stretching (5 min)
│   ├── Neck stretch (30s)
│   ├── Arm circles (30s)
│   ├── Leg stretch (1 min)
│   └── Ankle rotation (30s)
├── Phase 2: Main Training (20 min)
│   └── Jogging (20 min, free pace)
└── Phase 3: Cool-down Stretching (5 min)
    ├── Quad stretch (1 min)
    ├── Calf stretch (1 min)
    └── Full body relaxation (1 min)
```

## App Navigation

```
Bottom Tab Navigation (5 tabs)
├── Home
│   ├── Workout category cards
│   ├── Today's recommended plan
│   └── Check-in status overview
├── Workout
│   ├── Category list
│   ├── Plan detail -> Training mode
│   └── Training history
├── Check-in
│   ├── Check-in calendar
│   ├── Check-in details
│   └── Statistics
├── Community
│   ├── Feed
│   ├── Post creation
│   ├── Teams / Challenges
│   └── Leaderboard
└── Profile
    ├── Personal info
    ├── Reminder settings
    ├── My teams
    └── Settings
```

## Project Structure

```
fitness/
├── mobile/                    # React Native frontend
│   ├── src/
│   │   ├── app/              # Expo Router entry
│   │   ├── components/       # Shared components
│   │   ├── screens/          # Screen components
│   │   │   ├── home/
│   │   │   ├── workout/
│   │   │   ├── checkin/
│   │   │   ├── community/
│   │   │   └── profile/
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # API call layer
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   └── package.json
│
├── server/                    # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── workout/
│   │   │   ├── checkin/
│   │   │   ├── notification/
│   │   │   ├── post/
│   │   │   ├── team/
│   │   │   ├── challenge/
│   │   │   └── upload/
│   │   ├── common/           # Guards/filters/pipes
│   │   ├── database/         # DB config/migrations
│   │   └── main.ts
│   └── package.json
│
└── docs/                      # Documentation
```

## Key User Flows

### Training -> Check-in Flow
1. User selects workout category -> selects plan -> starts training
2. Step-by-step exercise guidance (timer/counter) -> completes training
3. Auto check-in popup -> add feedback/photos -> submit check-in
4. Check-in success -> optional "share to community"

### Social Interaction Flow
1. Browse feed (following + recommended) -> like/comment
2. Post content (text+images / linked check-in record)
3. Join challenge -> view leaderboard -> team competition

### Reminder Flow
1. User sets reminder time and repeat days
2. Local push notification triggered at scheduled time
3. Tap notification -> navigate directly to training page

## Commercial Model

Completely free. All features available to all users at no cost.
