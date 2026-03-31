import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectLinkType } from '@prisma/client';

export class CreateProjectLinkDto {
  @ApiProperty({ example: 'GitHub Repository' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'https://github.com/org/repo' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ enum: ProjectLinkType, default: 'OTHER' })
  @IsOptional()
  @IsEnum(ProjectLinkType)
  type?: ProjectLinkType;
}
