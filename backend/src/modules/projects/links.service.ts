import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectLinkDto, UpdateProjectLinkDto } from './dto';
import { ProjectLink } from '@prisma/client';

const ADDED_BY_SELECT = {
  select: { id: true, email: true, firstName: true, lastName: true },
} as const;

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    projectId: string,
    dto: CreateProjectLinkDto,
    addedById?: string,
  ): Promise<ProjectLink> {
    return this.prisma.projectLink.create({
      data: {
        ...dto,
        projectId,
        addedById,
      },
      include: { addedBy: ADDED_BY_SELECT },
    });
  }

  async findByProjectId(projectId: string): Promise<ProjectLink[]> {
    return this.prisma.projectLink.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { addedBy: ADDED_BY_SELECT },
    });
  }

  async update(id: string, dto: UpdateProjectLinkDto): Promise<ProjectLink> {
    await this.findByIdOrThrow(id);
    return this.prisma.projectLink.update({
      where: { id },
      data: dto,
      include: { addedBy: ADDED_BY_SELECT },
    });
  }

  async delete(id: string): Promise<ProjectLink> {
    await this.findByIdOrThrow(id);
    return this.prisma.projectLink.delete({ where: { id } });
  }

  private async findByIdOrThrow(id: string): Promise<ProjectLink> {
    const link = await this.prisma.projectLink.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Project link with id "${id}" not found`);
    }
    return link;
  }
}
