import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { Project, ProjectStage } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: dto,
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: { stage?: ProjectStage; organizationId?: string },
  ): Promise<PaginatedResult<Project>> {
    const where: Record<string, unknown> = {};

    if (filters?.stage) {
      where.stage = filters.stage;
    }

    if (filters?.organizationId) {
      where.organizationId = filters.organizationId;
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          niche: true,
          team: true,
          organization: true,
          discoveredBy: { select: { id: true, email: true, firstName: true, lastName: true } },
          assignedCloser: { select: { id: true, email: true, firstName: true, lastName: true } },
          assignedPM: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        niche: true,
        team: true,
        organization: true,
        discoveredBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        lastEditedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignedCloser: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignedPM: { select: { id: true, email: true, firstName: true, lastName: true } },
        milestones: { orderBy: { createdAt: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        meetings: { orderBy: { scheduledAt: 'asc' } },
        videoProposals: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findById(id);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async updateStage(id: string, stage: ProjectStage): Promise<Project> {
    await this.findById(id);

    return this.prisma.project.update({
      where: { id },
      data: { stage },
    });
  }
}
