import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDealDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  proposalId: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Client wants fixed-price contract' })
  @IsOptional()
  @IsString()
  notes?: string;
}
