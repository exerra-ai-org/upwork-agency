import { IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Role ID to assign to the user' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ description: 'Organization ID to assign to the user' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({ description: 'Team ID to assign to the user' })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
