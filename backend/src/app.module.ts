import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationsModule } from './registrations/registrations.module';
import { UserModule } from './users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from './events/events.module';

@Module({
  imports: [ConfigModule.forRoot({
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
  }), EventsModule,UserModule, RegistrationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
