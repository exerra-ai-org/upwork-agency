import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty({ example: '2025-01-01', description: 'Start date (ISO 8601)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-31', description: 'End date (ISO 8601)' })
  @IsDateString()
  endDate: string;
}
