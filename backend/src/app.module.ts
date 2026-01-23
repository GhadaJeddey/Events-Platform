import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AuthModule } from './auth/auth.module';
import { ClubsModule } from './clubs/clubs.module';
import { ClubsModule } from './clubs/clubs.module';
import { StudentsModule } from './students/students.module';
import { OrganizersModule } from './organizers/organizers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // config globale pour toute l'application
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), //checks process.env.DATABASE_URL
        autoLoadEntities: true,
        synchronize: true, //DEV
        ssl: { rejectUnauthorized: false },
      }),
    }),
    AuthModule,
    EventsModule,
    UsersModule,
    ClubsModule,
    RegistrationsModule,
    StudentsModule,
    OrganizersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
