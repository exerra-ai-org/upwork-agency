import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto';

export class FindEventsDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'proposal_submitted' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ example: 'proposal' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ example: 'clxyz123abc' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ example: 'user-456' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
