import { 
  Controller, 
  Get, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { StudentsService } from '../services/students.service';
import { UpdateStudentDto } from '../dto/update-student.dto';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // Ton décorateur perso
import { UserRole } from '../../common/enums/user.enums';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Students') // Pour grouper dans Swagger
@ApiBearerAuth() // Indique que ces routes nécessitent un token
@UseGuards(AuthGuard, RolesGuard) // Sécurise tout le contrôleur
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user student profile' })
  async getMyProfile(@CurrentUser() user) {
    // L'utilisateur récupère SON profil grâce à son token
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