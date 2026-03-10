import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeetingType } from '@prisma/client';

export class CreateMeetingDto {
  @ApiProperty({ example: 'clxyz123-project-id' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ example: 'clxyz123-closer-id' })
  @IsOptional()
  @IsUUID()
  closerId?: string;

  @ApiPropertyOptional({ enum: MeetingType, default: MeetingType.INTERVIEW })
  @IsOptional()
  @IsEnum(MeetingType)
  type?: MeetingType;

  @ApiProperty({ example: '2026-03-15T14:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional({ example: 'https://fathom.video/share/abc123' })
  @IsOptional()
  @IsString()
  fathomUrl?: string;

  @ApiPropertyOptional({ example: 'https://loom.com/share/def456' })
  @IsOptional()
  @IsString()
  loomUrl?: string;

  @ApiPropertyOptional({ example: 'https://drive.google.com/file/abc' })
  @IsOptional()
  @IsString()
  driveUrl?: string;
}
