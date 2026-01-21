import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { RegistrationsModule } from './registrations/registrations.module';

import { AuthModule } from './auth/auth.module';
@Module({
  imports: [AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    EventsModule,
    RegistrationsModule,
    UsersModule,
    RegistrationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
/**
 * Root module of the application.
 * Configures the application, including DB connection and sub-modules.
 */
export class AppModule { }
