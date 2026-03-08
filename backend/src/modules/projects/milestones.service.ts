import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto';
import { Milestone } from '@prisma/client';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateMilestoneDto): Promise<Milestone> {
    return this.prisma.milestone.create({
      data: {
        ...dto,
        projectId,
      },
    });
  }

  async findByProjectId(projectId: string): Promise<Milestone[]> {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateMilestoneDto): Promise<Milestone> {
    await this.findByIdOrThrow(id);

    return this.prisma.milestone.update({
      where: { id },
      data: dto,
    });
  }

  async complete(id: string): Promise<Milestone> {
    await this.findByIdOrThrow(id);

    return this.prisma.milestone.update({
      where: { id },
      data: { completed: true },
    });
  }

  async delete(id: string): Promise<Milestone> {
    await this.findByIdOrThrow(id);

    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  private async findByIdOrThrow(id: string): Promise<Milestone> {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with id "${id}" not found`);
    }

    return milestone;
  }
}
