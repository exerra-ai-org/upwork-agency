import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteMeetingDto {
  @ApiPropertyOptional({ example: 'Client wants to proceed with the project.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'https://fathom.video/share/abc123' })
  @IsOptional()
  @IsString()
  fathomUrl?: string;

  @ApiPropertyOptional({ example: 'https://loom.com/share/def456' })
  @IsOptional()
  @IsString()
  loomUrl?: string;

  @ApiPropertyOptional({ example: 'https://drive.google.com/file/abc' })
  @IsOptional()
  @IsString()
  driveUrl?: string;
}
