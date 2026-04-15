# Phase 1: Foundation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full-stack project (React Native + NestJS), set up database with User entity, implement JWT authentication (register/login/refresh), and build the mobile auth screens (login/register/profile).

**Architecture:** NestJS monolith backend with AuthModule and UserModule. PostgreSQL via TypeORM for persistence. React Native (Expo) frontend with Zustand for auth state and Axios for API calls. JWT access+refresh token pattern.

**Tech Stack:** React Native, Expo, TypeScript, NestJS, TypeORM, PostgreSQL, bcrypt, @nestjs/jwt, @nestjs/passport, Zustand, Axios

---

## File Structure

### Backend (`server/`)

| File | Responsibility |
|---|---|
| `server/package.json` | Backend dependencies and scripts |
| `server/tsconfig.json` | TypeScript config |
| `server/src/main.ts` | NestJS bootstrap, CORS, validation pipe |
| `server/src/app.module.ts` | Root module importing all feature modules |
| `server/src/database/database.module.ts` | TypeORM config, PostgreSQL connection |
| `server/src/modules/user/user.entity.ts` | User entity (TypeORM) |
| `server/src/modules/user/user.module.ts` | User module |
| `server/src/modules/user/user.service.ts` | User CRUD logic |
| `server/src/modules/user/user.controller.ts` | User profile endpoints |
| `server/src/modules/user/dto/update-user.dto.ts` | DTO for profile updates |
| `server/src/modules/auth/auth.module.ts` | Auth module |
| `server/src/modules/auth/auth.service.ts` | Register, login, token refresh logic |
| `server/src/modules/auth/auth.controller.ts` | Auth endpoints |
| `server/src/modules/auth/dto/register.dto.ts` | DTO for registration |
| `server/src/modules/auth/dto/login.dto.ts` | DTO for login |
| `server/src/modules/auth/jwt.strategy.ts` | Passport JWT strategy |
| `server/src/common/guards/jwt-auth.guard.ts` | JWT auth guard |
| `server/src/common/decorators/current-user.decorator.ts` | @CurrentUser() param decorator |
| `server/test/auth.e2e-spec.ts` | Auth endpoint E2E tests |
| `server/test/user.e2e-spec.ts` | User endpoint E2E tests |

### Frontend (`mobile/`)

| File | Responsibility |
|---|---|
| `mobile/package.json` | Frontend dependencies |
| `mobile/app.json` | Expo config |
| `mobile/tsconfig.json` | TypeScript config |
| `mobile/src/app/_layout.tsx` | Root layout with auth state check |
| `mobile/src/app/(auth)/login.tsx` | Login screen |
| `mobile/src/app/(auth)/register.tsx` | Register screen |
| `mobile/src/app/(auth)/_layout.tsx` | Auth stack layout |
| `mobile/src/app/(tabs)/_layout.tsx` | Tab navigator layout (5 tabs, placeholder screens) |
| `mobile/src/app/(tabs)/index.tsx` | Home tab placeholder |
| `mobile/src/app/(tabs)/workout.tsx` | Workout tab placeholder |
| `mobile/src/app/(tabs)/checkin.tsx` | Check-in tab placeholder |
| `mobile/src/app/(tabs)/community.tsx` | Community tab placeholder |
| `mobile/src/app/(tabs)/profile.tsx` | Profile screen with user info + logout |
| `mobile/src/services/api.ts` | Axios instance with token interceptor |
| `mobile/src/services/auth.service.ts` | Auth API calls (register, login, refresh) |
| `mobile/src/services/user.service.ts` | User API calls (getProfile, updateProfile) |
| `mobile/src/stores/auth.store.ts` | Zustand auth store (token, user, login/logout) |
| `mobile/src/types/user.ts` | User type definition |

---

## Task 1: Initialize NestJS Backend Project

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/main.ts`
- Create: `server/src/app.module.ts`

- [ ] **Step 1: Scaffold NestJS project**

```bash
cd /c/code/fitness
npx @nestjs/cli new server --package-manager npm --skip-git
```

- [ ] **Step 2: Install additional dependencies**

```bash
cd /c/code/fitness/server
npm install @nestjs/typeorm typeorm pg bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer
npm install -D @types/bcrypt @types/passport-jwt
```

- [ ] **Step 3: Update `server/src/main.ts` to enable CORS and validation**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 4: Verify the server starts**

```bash
cd /c/code/fitness/server
npm run start:dev
```

Expected: Server starts on port 3000 with no errors.

- [ ] **Step 5: Commit**

```bash
cd /c/code/fitness
git add server/
git commit -m "feat: scaffold NestJS backend with validation and CORS"
```

---

## Task 2: Database Module and User Entity

**Files:**
- Create: `server/src/database/database.module.ts`
- Create: `server/src/modules/user/user.entity.ts`
- Create: `server/src/modules/user/user.module.ts`
- Create: `server/src/modules/user/user.service.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Create database module at `server/src/database/database.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fitlife',
      autoLoadEntities: true,
      synchronize: true, // dev only, use migrations in production
    }),
  ],
})
export class DatabaseModule {}
```

- [ ] **Step 2: Create User entity at `server/src/modules/user/user.entity.ts`**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'enum', enum: FitnessLevel, default: FitnessLevel.BEGINNER })
  fitnessLevel: FitnessLevel;

  @Column('simple-array', { nullable: true })
  deviceTokens: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 3: Create User service at `server/src/modules/user/user.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data);
    return this.findById(id);
  }
}
```

- [ ] **Step 4: Create User module at `server/src/modules/user/user.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

- [ ] **Step 5: Update `server/src/app.module.ts` to import DatabaseModule and UserModule**

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
})
export class AppModule {}
```

- [ ] **Step 6: Create the `fitlife` database and verify connection**

```bash
# Create database (assumes PostgreSQL is running locally)
psql -U postgres -c "CREATE DATABASE fitlife;" 2>/dev/null || echo "Database may already exist"

# Start server to verify TypeORM syncs the users table
cd /c/code/fitness/server
npm run start:dev
```

Expected: Server starts, `users` table is created automatically (synchronize: true).

- [ ] **Step 7: Commit**

```bash
cd /c/code/fitness
git add server/src/database/ server/src/modules/user/ server/src/app.module.ts
git commit -m "feat: add database module and User entity with TypeORM"
```

---

## Task 3: Auth Module - JWT Strategy and Guards

**Files:**
- Create: `server/src/modules/auth/dto/register.dto.ts`
- Create: `server/src/modules/auth/dto/login.dto.ts`
- Create: `server/src/modules/auth/auth.service.ts`
- Create: `server/src/modules/auth/jwt.strategy.ts`
- Create: `server/src/modules/auth/auth.controller.ts`
- Create: `server/src/modules/auth/auth.module.ts`
- Create: `server/src/common/guards/jwt-auth.guard.ts`
- Create: `server/src/common/decorators/current-user.decorator.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Step 1: Create register DTO at `server/src/modules/auth/dto/register.dto.ts`**

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;
}
```

- [ ] **Step 2: Create login DTO at `server/src/modules/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

- [ ] **Step 3: Create auth service at `server/src/modules/auth/auth.service.ts`**

```typescript
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.userService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    return this.generateTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user.id);
  }

  private generateTokens(userId: string) {
    const payload = { sub: userId };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
```

- [ ] **Step 4: Create JWT strategy at `server/src/modules/auth/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'fitlife-jwt-secret-dev',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

- [ ] **Step 5: Create JWT auth guard at `server/src/common/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 6: Create @CurrentUser decorator at `server/src/common/decorators/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 7: Create auth controller at `server/src/modules/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@CurrentUser() user: User) {
    return this.authService.refreshToken(user.id);
  }
}
```

- [ ] **Step 8: Create auth module at `server/src/modules/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fitlife-jwt-secret-dev',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

- [ ] **Step 9: Update `server/src/app.module.ts` to import AuthModule**

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule],
})
export class AppModule {}
```

- [ ] **Step 10: Commit**

```bash
cd /c/code/fitness
git add server/src/modules/auth/ server/src/common/ server/src/app.module.ts
git commit -m "feat: add auth module with JWT register/login/refresh"
```

---

## Task 4: User Profile Endpoint

**Files:**
- Create: `server/src/modules/user/dto/update-user.dto.ts`
- Create: `server/src/modules/user/user.controller.ts`
- Modify: `server/src/modules/user/user.module.ts`

- [ ] **Step 1: Create update-user DTO at `server/src/modules/user/dto/update-user.dto.ts`**

```typescript
import { IsString, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { FitnessLevel } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;
}
```

- [ ] **Step 2: Create user controller at `server/src/modules/user/user.controller.ts`**

```typescript
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    const { passwordHash, ...profile } = user;
    return profile;
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(user.id, dto);
    const { passwordHash, ...profile } = updated;
    return profile;
  }
}
```

- [ ] **Step 3: Update `server/src/modules/user/user.module.ts` to add controller**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

- [ ] **Step 4: Commit**

```bash
cd /c/code/fitness
git add server/src/modules/user/
git commit -m "feat: add user profile GET/PATCH endpoints"
```

---

## Task 5: Backend E2E Tests

**Files:**
- Create: `server/test/auth.e2e-spec.ts`
- Create: `server/test/user.e2e-spec.ts`

- [ ] **Step 1: Create auth E2E tests at `server/test/auth.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    username: `testuser${Date.now()}`,
  };

  let accessToken: string;

  it('POST /auth/register - should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
  });

  it('POST /auth/register - should reject duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('POST /auth/login - should login with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/login - should reject invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /auth/refresh - should return new tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/register - should reject invalid email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'notanemail', password: 'password123', username: 'test' })
      .expect(400);
  });
});
```

- [ ] **Step 2: Create user E2E tests at `server/test/user.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register a user to get a token
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `usertest-${Date.now()}@example.com`,
        password: 'password123',
        username: `usertest${Date.now()}`,
      });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/me - should return current user profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('username');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('GET /users/me - should reject without token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });

  it('PATCH /users/me - should update user profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ bio: 'Fitness beginner!', height: 175, weight: 70 })
      .expect(200);

    expect(res.body.bio).toBe('Fitness beginner!');
    expect(res.body.height).toBe(175);
    expect(res.body.weight).toBe(70);
  });

  it('PATCH /users/me - should reject invalid fitnessLevel', async () => {
    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fitnessLevel: 'invalid' })
      .expect(400);
  });
});
```

- [ ] **Step 3: Run E2E tests**

```bash
cd /c/code/fitness/server
npm run test:e2e
```

Expected: All 10 tests pass.

- [ ] **Step 4: Commit**

```bash
cd /c/code/fitness
git add server/test/
git commit -m "test: add auth and user E2E tests"
```

---

## Task 6: Initialize React Native (Expo) Frontend

**Files:**
- Create: `mobile/` (Expo scaffolding)
- Create: `mobile/src/types/user.ts`

- [ ] **Step 1: Create Expo project**

```bash
cd /c/code/fitness
npx create-expo-app mobile --template blank-typescript
```

- [ ] **Step 2: Install dependencies**

```bash
cd /c/code/fitness/mobile
npx expo install expo-router expo-constants expo-linking expo-status-bar react-native-screens react-native-safe-area-context
npm install zustand axios @react-navigation/bottom-tabs @react-navigation/native react-native-gesture-handler
npm install expo-secure-store
```

- [ ] **Step 3: Create User type at `mobile/src/types/user.ts`**

```typescript
export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  height: number | null;
  weight: number | null;
  fitnessLevel: FitnessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/code/fitness
git add mobile/
git commit -m "feat: scaffold Expo React Native frontend"
```

---

## Task 7: API Service Layer and Auth Store

**Files:**
- Create: `mobile/src/services/api.ts`
- Create: `mobile/src/services/auth.service.ts`
- Create: `mobile/src/services/user.service.ts`
- Create: `mobile/src/stores/auth.store.ts`

- [ ] **Step 1: Create Axios instance at `mobile/src/services/api.ts`**

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000' // Android emulator
  : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          await SecureStore.setItemAsync('accessToken', res.data.accessToken);
          await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

- [ ] **Step 2: Create auth service at `mobile/src/services/auth.service.ts`**

```typescript
import api from './api';
import { AuthTokens } from '../types/user';

export const authService = {
  register: async (email: string, password: string, username: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/register', { email, password, username });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};
```

- [ ] **Step 3: Create user service at `mobile/src/services/user.service.ts`**

```typescript
import api from './api';
import { User } from '../types/user';

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },
};
```

- [ ] **Step 4: Create auth store at `mobile/src/stores/auth.store.ts`**

```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const tokens = await authService.login(email, password);
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    const user = await userService.getProfile();
    set({ user, isAuthenticated: true });
  },

  register: async (email, password, username) => {
    const tokens = await authService.register(email, password, username);
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    const user = await userService.getProfile();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const user = await userService.getProfile();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Step 5: Commit**

```bash
cd /c/code/fitness
git add mobile/src/services/ mobile/src/stores/ mobile/src/types/
git commit -m "feat: add API service layer and auth store"
```

---

## Task 8: Auth Screens (Login & Register)

**Files:**
- Create: `mobile/src/app/(auth)/_layout.tsx`
- Create: `mobile/src/app/(auth)/login.tsx`
- Create: `mobile/src/app/(auth)/register.tsx`

- [ ] **Step 1: Create auth layout at `mobile/src/app/(auth)/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create login screen at `mobile/src/app/(auth)/login.tsx`**

```tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitLife</Text>
      <Text style={styles.subtitle}>Start your fitness journey</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});
```

- [ ] **Step 3: Create register screen at `mobile/src/app/(auth)/register.tsx`**

```tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, username);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join the FitLife community</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd /c/code/fitness
git add mobile/src/app/
git commit -m "feat: add login and register screens"
```

---

## Task 9: Tab Navigation and Root Layout

**Files:**
- Create: `mobile/src/app/_layout.tsx`
- Create: `mobile/src/app/(tabs)/_layout.tsx`
- Create: `mobile/src/app/(tabs)/index.tsx`
- Create: `mobile/src/app/(tabs)/workout.tsx`
- Create: `mobile/src/app/(tabs)/checkin.tsx`
- Create: `mobile/src/app/(tabs)/community.tsx`
- Create: `mobile/src/app/(tabs)/profile.tsx`

- [ ] **Step 1: Create root layout at `mobile/src/app/_layout.tsx`**

```tsx
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <Slot />;
}
```

- [ ] **Step 2: Create tab layout at `mobile/src/app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💪</Text>,
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Create Home placeholder at `mobile/src/app/(tabs)/index.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FitLife</Text>
      <Text style={styles.subtitle}>Your fitness journey starts here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
```

- [ ] **Step 4: Create Workout placeholder at `mobile/src/app/(tabs)/workout.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
```

- [ ] **Step 5: Create Check-in placeholder at `mobile/src/app/(tabs)/checkin.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function CheckInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
```

- [ ] **Step 6: Create Community placeholder at `mobile/src/app/(tabs)/community.tsx`**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
```

- [ ] **Step 7: Create Profile screen at `mobile/src/app/(tabs)/profile.tsx`**

```tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/auth.store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {user?.username?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.height || '--'}</Text>
          <Text style={styles.statLabel}>Height (cm)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.weight || '--'}</Text>
          <Text style={styles.statLabel}>Weight (kg)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.fitnessLevel || '--'}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: '#f5f5f5' },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  username: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  bio: { fontSize: 14, color: '#666', marginTop: 12, paddingHorizontal: 40, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 30, gap: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#ff5252',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 8: Commit**

```bash
cd /c/code/fitness
git add mobile/src/app/
git commit -m "feat: add tab navigation, root layout with auth redirect, and profile screen"
```

---

## Task 10: End-to-End Verification

- [ ] **Step 1: Start PostgreSQL and verify `fitlife` database exists**

```bash
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='fitlife';" | grep -q 1 || psql -U postgres -c "CREATE DATABASE fitlife;"
```

- [ ] **Step 2: Start backend server**

```bash
cd /c/code/fitness/server
npm run start:dev
```

Expected: Server starts on port 3000, `users` table synced.

- [ ] **Step 3: Test auth endpoints manually**

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@fitlife.com","password":"pass123456","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@fitlife.com","password":"pass123456"}'

# Get profile (replace TOKEN with the accessToken from login response)
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer TOKEN"
```

Expected: Register returns tokens, login returns tokens, profile returns user data without passwordHash.

- [ ] **Step 4: Start mobile app**

```bash
cd /c/code/fitness/mobile
npx expo start
```

Expected: App starts, shows login screen. Can register, login, see profile, logout.

- [ ] **Step 5: Run E2E tests**

```bash
cd /c/code/fitness/server
npm run test:e2e
```

Expected: All tests pass.

- [ ] **Step 6: Final commit**

```bash
cd /c/code/fitness
git add -A
git commit -m "feat: complete Phase 1 - foundation (auth + user + navigation)"
```
