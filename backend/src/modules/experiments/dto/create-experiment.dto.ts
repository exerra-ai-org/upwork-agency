import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperimentDto {
  @ApiProperty({ example: 'Onboarding Flow A/B Test' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Test whether a simplified onboarding increases conversion' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Simplified onboarding will increase conversion by 15%' })
  @IsOptional()
  @IsString()
  hypothesis?: string;

  @ApiProperty({ example: 'proposal' })
  @IsString()
  @IsNotEmpty()
  targetEntity: string;

  @ApiProperty({
    example: [
      { name: 'control', weight: 50 },
      { name: 'variant_a', weight: 50 },
    ],
  })
  @IsArray()
  variants: any[];
}
