import { Module } from '@nestjs/common';
import { OrganizersService } from './services/organizers.service';
import { OrganizersController } from './controllers/organizers.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizer } from './entities/organizer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer])],
  controllers: [OrganizersController],
  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
