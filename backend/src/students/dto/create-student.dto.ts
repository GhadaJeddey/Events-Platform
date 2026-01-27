import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";


export class CreateStudentDto {
@ApiProperty({ example: 'RT2', description: 'Major of the student' })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({ example: '12345678', description: 'Unique student card ID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  studentCardNumber: string;
}
