import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoProposalDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  proposalId: string;

  @ApiProperty({ example: 'https://cdn.example.com/videos/proposal-intro.mp4' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 'videos/a1b2c3d4/proposal-intro.mp4' })
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

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/thumbnails/proposal-intro.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
