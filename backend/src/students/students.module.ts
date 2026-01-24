import { Module, forwardRef } from '@nestjs/common';
import { StudentsService } from './services/students.service';
import { StudentsController } from './controllers/students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { AuthModule } from '../auth/auth.module';

console.log('StudentsService:', StudentsService);

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    forwardRef(() => AuthModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],

})
export class StudentsModule {}
