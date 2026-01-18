import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationsModule } from './registrations/registrations.module';
import { UserModule } from './users/user.module';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, 
      ssl: {
        rejectUnauthorized: false, // Required for some Supabase/Cloud connections
      },
      // Dev Only
      synchronize: true, 
    }),
    UserModule,
    EventsModule,
    RegistrationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
