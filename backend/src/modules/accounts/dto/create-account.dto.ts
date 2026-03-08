import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountPlatform, AccountStatus } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ enum: AccountPlatform, example: AccountPlatform.UPWORK })
  @IsEnum(AccountPlatform)
  platform: AccountPlatform;

  @ApiProperty({ example: 'my-upwork-account' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiPropertyOptional({ example: 'https://www.upwork.com/freelancers/~01abc' })
  @IsOptional()
  @IsString()
  profileUrl?: string;

  @ApiPropertyOptional({ enum: AccountStatus, default: AccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}
