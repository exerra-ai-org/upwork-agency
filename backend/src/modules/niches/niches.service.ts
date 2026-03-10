import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateNicheDto, UpdateNicheDto } from './dto';

@Injectable()
export class NichesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNicheDto) {
    return this.prisma.niche.create({ data: dto });
  }

  async findAll(organizationId?: string, includeInactive = false) {
    const where: Record<string, unknown> = includeInactive ? {} : { isActive: true };
    if (organizationId) where.organizationId = organizationId;
    return this.prisma.niche.findMany({
      where,
      include: { _count: { select: { projects: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const niche = await this.prisma.niche.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!niche) throw new NotFoundException('Niche not found');
    return niche;
  }

  async update(id: string, dto: UpdateNicheDto) {
    await this.findOne(id);
    return this.prisma.niche.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.niche.update({ where: { id }, data: { isActive: false } });
  }
}
