import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from '../../common/enums/event.enums'; 

export class UpdateEventStatusDto {
  @ApiProperty({
    enum: ApprovalStatus,
    description: "Nouveau statut d'approbation (approved, rejected, cancelled)",
    example: ApprovalStatus.APPROVED
  })
  @IsNotEmpty()
  @IsEnum(ApprovalStatus, {
    message: `Le statut doit être l'une des valeurs suivantes : ${Object.values(ApprovalStatus).join(', ')}`
  })
  status: ApprovalStatus;
}