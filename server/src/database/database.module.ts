import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'zcDsj@2024',
            database: process.env.DB_NAME || 'fitlife',
          }),
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL || process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    }),
  ],
})
export class DatabaseModule {}
