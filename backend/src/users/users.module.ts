import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersService],
    exports: [UsersService],
})
/**
 * Module for managing user-related operations.
 * Exports UsersService for use in other modules.
 */
export class UsersModule { }
