import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateExperimentDto, UpdateExperimentDto, CreateAssignmentDto } from './dto';
import { Experiment, ExperimentAssignment, ExperimentStatus } from '@prisma/client';

@Injectable()
export class ExperimentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExperimentDto): Promise<Experiment> {
    return this.prisma.experiment.create({
      data: dto,
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: { status?: ExperimentStatus },
  ): Promise<PaginatedResult<Experiment>> {
    const where: Record<string, unknown> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.experiment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.experiment.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Experiment & { assignments: ExperimentAssignment[] }> {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with id "${id}" not found`);
    }

    return experiment;
  }

  async update(id: string, dto: UpdateExperimentDto): Promise<Experiment> {
    await this.findById(id);

    return this.prisma.experiment.update({
      where: { id },
      data: dto,
    });
  }

  async start(id: string): Promise<Experiment> {
    await this.findById(id);

    return this.prisma.experiment.update({
      where: { id },
      data: {
        status: ExperimentStatus.RUNNING,
        startDate: new Date(),
      },
    });
  }

  async pause(id: string): Promise<Experiment> {
    await this.findById(id);

    return this.prisma.experiment.update({
      where: { id },
      data: {
        status: ExperimentStatus.PAUSED,
      },
    });
  }

  async complete(id: string): Promise<Experiment> {
    await this.findById(id);

    return this.prisma.experiment.update({
      where: { id },
      data: {
        status: ExperimentStatus.COMPLETED,
        endDate: new Date(),
      },
    });
  }

  async assignVariant(
    experimentId: string,
    dto: CreateAssignmentDto,
  ): Promise<ExperimentAssignment> {
    await this.findById(experimentId);

    return this.prisma.experimentAssignment.create({
      data: {
        experimentId,
        agentId: dto.agentId,
        proposalId: dto.proposalId,
        variant: dto.variant,
      },
    });
  }

  async getResults(id: string) {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment with id "${id}" not found`);
    }

    const grouped = experiment.assignments.reduce<
      Record<string, { variant: string; count: number; assignments: ExperimentAssignment[] }>
    >((acc, assignment) => {
      const key = assignment.variant;
      if (!acc[key]) {
        acc[key] = { variant: key, count: 0, assignments: [] };
      }
      acc[key].count += 1;
      acc[key].assignments.push(assignment);
      return acc;
    }, {});

    return {
      ...experiment,
      results: Object.values(grouped),
    };
  }
}
