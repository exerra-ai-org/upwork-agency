import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DealStatus } from '@prisma/client';

export class UpdateDealDto {
  @ApiPropertyOptional({ example: 7500 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Revised terms after negotiation' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: DealStatus, example: DealStatus.NEGOTIATING })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}
