import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiPropertyOptional({ example: 'clxyz123-project-id' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ example: 'variant_a' })
  @IsString()
  variant: string;
}
