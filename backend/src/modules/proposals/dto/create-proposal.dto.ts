import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalStatus } from '@prisma/client';

export class CreateProposalDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  agentId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsOptional()
  @IsUUID()
  scriptVersionId?: string;

  @ApiPropertyOptional({ example: 'Senior Full-Stack Developer' })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'https://www.upwork.com/jobs/~01abc' })
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiPropertyOptional({ example: 'I am excited to apply for this role...' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  bidAmount?: number;

  @ApiPropertyOptional({
    enum: ProposalStatus,
    default: ProposalStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}
