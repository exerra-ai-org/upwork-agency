import { IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QAStatus } from '@prisma/client';

export class UpdateQAReviewDto {
  @ApiPropertyOptional({ enum: QAStatus, example: QAStatus.APPROVED })
  @IsOptional()
  @IsEnum(QAStatus)
  status?: QAStatus;

  @ApiPropertyOptional({ example: 9, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  score?: number;

  @ApiPropertyOptional({ example: 'Approved after revisions.' })
  @IsOptional()
  @IsString()
  comments?: string;
}
