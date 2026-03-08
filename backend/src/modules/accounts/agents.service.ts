import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateAgentDto, UpdateAgentDto } from './dto';
import { Agent } from '@prisma/client';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgentDto): Promise<Agent> {
    return this.prisma.agent.create({
      data: dto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Agent>> {
    const [data, total] = await Promise.all([
      this.prisma.agent.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count(),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Agent> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: { user: true, freelanceAccount: true },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with id "${id}" not found`);
    }

    return agent;
  }

  async findByUserId(userId: string): Promise<Agent[]> {
    return this.prisma.agent.findMany({
      where: { userId },
      include: { freelanceAccount: true },
    });
  }

  async update(id: string, dto: UpdateAgentDto): Promise<Agent> {
    await this.findById(id);

    return this.prisma.agent.update({
      where: { id },
      data: dto,
    });
  }
}
