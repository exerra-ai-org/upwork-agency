import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'proposal_submitted' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: 'proposal' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'clxyz123abc' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ example: 'user-456' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ example: { source: 'web', ip: '127.0.0.1' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
