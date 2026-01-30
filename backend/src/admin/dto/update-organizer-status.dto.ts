import { IsEnum, IsNotEmpty } from 'class-validator';

import { OrganizerStatus } from '../../common/enums/organizers.enum';

export class UpdateOrganizerStatusDto {
  @IsEnum(OrganizerStatus)
  @IsNotEmpty()
  status: OrganizerStatus;
}
