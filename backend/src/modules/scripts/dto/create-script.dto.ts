import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScriptDto {
  @ApiProperty({ example: 'Cold Outreach v1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'outreach' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Hi {{name}}, I noticed your job posting...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
