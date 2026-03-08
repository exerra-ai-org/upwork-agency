import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: ProposalStatus, example: ProposalStatus.SENT })
  @IsEnum(ProposalStatus)
  status: ProposalStatus;
}
