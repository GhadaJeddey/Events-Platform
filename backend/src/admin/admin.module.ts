import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity'; 
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Event]), 
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
