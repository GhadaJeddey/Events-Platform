import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { StudentsService } from './services/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

import { AuthGuard } from '../auth/Guards/auth.guard';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Ton décorateur perso
import { Role } from '../common/enums/role.enum';

@ApiTags('Students') // Pour grouper dans Swagger
@ApiBearerAuth() // Indique que ces routes nécessitent un token
@UseGuards(AuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Post('me')
  @ApiOperation({ summary: 'Create current user student profile' })
  async createMyProfile(
    @CurrentUser() user,
    @Body() createStudentDto: CreateStudentDto
  ) {
    return this.studentsService.create(user, createStudentDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user student profile' })
  async getMyProfile(@CurrentUser() user) {

    return this.studentsService.findOneByUserId(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user student profile' })
  async updateMyProfile(
    @CurrentUser() user,
    @Body() updateStudentDto: UpdateStudentDto
  ) {
    const student = await this.studentsService.findOneByUserId(user.id);
    return this.studentsService.update(student.id, updateStudentDto);
  }


  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all students (Admin only)' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get one student by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a student by ID (Admin only)' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

}