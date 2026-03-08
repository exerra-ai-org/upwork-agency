import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiPropertyOptional({ example: 'clxyz123-agent-id' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({ example: 'clxyz123-proposal-id' })
  @IsOptional()
  @IsUUID()
  proposalId?: string;

  @ApiProperty({ example: 'variant_a' })
  @IsString()
  variant: string;
}
