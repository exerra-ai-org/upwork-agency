import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedResult } from '@/common/dto';
import { CreateEventDto, FindEventsDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({ data: dto });
  }

  async createBatch(dtos: CreateEventDto[]) {
    return this.prisma.event.createMany({ data: dtos });
  }

  async findAll(query: FindEventsDto) {
    const where: Prisma.EventWhereInput = {};

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.actorId) {
      where.actorId = query.actorId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return event;
  }

  async countByType(entityType: string, entityId: string) {
    const counts = await this.prisma.event.groupBy({
      by: ['eventType'],
      where: { entityType, entityId },
      _count: { eventType: true },
    });

    return counts.map((entry) => ({
      eventType: entry.eventType,
      count: entry._count.eventType,
    }));
  }
}
