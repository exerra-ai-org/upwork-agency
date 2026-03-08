import { IsString, IsOptional, IsNumber, IsInt, IsEnum, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountPlatform } from '@prisma/client';

export class CreateClientDto {
  @ApiPropertyOptional({ example: 'mp-12345' })
  @IsOptional()
  @IsString()
  marketplaceId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ enum: AccountPlatform, example: AccountPlatform.UPWORK })
  @IsOptional()
  @IsEnum(AccountPlatform)
  platform?: AccountPlatform;

  @ApiPropertyOptional({ example: 'https://www.upwork.com/clients/~012345' })
  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 50000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpent?: number;

  @ApiPropertyOptional({ example: 75.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hireRate?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(0)
  jobsPosted?: number;
}
