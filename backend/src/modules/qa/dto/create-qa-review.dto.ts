import { IsUUID, IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQAReviewDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  reviewerId: string;

  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  score?: number;

  @ApiPropertyOptional({ example: 'Good work, minor formatting issues.' })
  @IsOptional()
  @IsString()
  comments?: string;
}
