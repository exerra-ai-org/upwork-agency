import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: 'clxyz123-proposal-id' })
  @IsString()
  @IsNotEmpty()
  proposalId: string;

  @ApiPropertyOptional({ example: 'clxyz123-closer-id' })
  @IsOptional()
  @IsString()
  closerId?: string;

  @ApiProperty({ example: '2026-03-15T14:00:00.000Z' })
  @IsDateString()
  scheduledAt: Date;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingUrl?: string;
}
