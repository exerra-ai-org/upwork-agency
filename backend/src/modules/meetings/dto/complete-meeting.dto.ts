import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CompleteMeetingDto {
  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ example: 'Client wants to proceed with the project.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
