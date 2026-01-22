import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 👇 Make sure all 3 are imported here
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. Global Config (Keep his work)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Database Connection (Keep his work)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),

    // 3. Application Modules (COMBINE THEM ALL)
    AuthModule,   // His Auth
    UsersModule,  // Shared Users
    EventsModule, // 👈 UNCOMMENTED! This is your Events feature.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }