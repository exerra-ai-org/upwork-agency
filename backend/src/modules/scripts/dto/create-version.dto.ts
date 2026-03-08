import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionDto {
  @ApiProperty({ example: 'Hi {{name}}, I saw your project and...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
