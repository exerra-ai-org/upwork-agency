import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Build AI Chatbot for Customer Support' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'https://www.upwork.com/jobs/~01abc123' })
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiProperty({ enum: PricingType })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMin?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMax?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;

  @ApiProperty({ example: 'org-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  nicheId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  discoveredById?: string;
}
