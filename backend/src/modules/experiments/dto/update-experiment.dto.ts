import { PartialType, PickType } from '@nestjs/swagger';
import { CreateExperimentDto } from './create-experiment.dto';

export class UpdateExperimentDto extends PartialType(
  PickType(CreateExperimentDto, ['name', 'description', 'hypothesis'] as const),
) {}
