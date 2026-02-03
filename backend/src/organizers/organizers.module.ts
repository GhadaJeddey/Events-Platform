import { Module, forwardRef } from '@nestjs/common';
import { OrganizersService } from './services/organizers.service';
import { OrganizersController } from './organizers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizer } from './entities/organizer.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from 'src/users/services/users.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Organizer, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [OrganizersController],
  providers: [OrganizersService, UsersService],
  exports: [OrganizersService],
})
export class OrganizersModule { }
