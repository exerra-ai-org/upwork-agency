import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoProposalDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Project ID' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'https://cdn.example.com/videos/loom-recording.mp4' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 'videos/a1b2c3d4/loom-recording.mp4' })
  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @ApiPropertyOptional({ description: 'Duration in seconds', example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ description: 'File size in bytes', example: 5242880 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'video/mp4' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/thumbnails/thumb.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
