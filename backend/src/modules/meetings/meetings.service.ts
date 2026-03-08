import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateMeetingDto, UpdateMeetingDto, CompleteMeetingDto } from './dto';
import { Meeting, MeetingStatus } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMeetingDto): Promise<Meeting> {
    return this.prisma.meeting.create({
      data: dto,
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: { closerId?: string; status?: MeetingStatus },
  ): Promise<PaginatedResult<Meeting>> {
    const where: Record<string, unknown> = {};

    if (filters?.closerId) {
      where.closerId = filters.closerId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: { proposal: true },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Meeting> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { proposal: true, closer: true },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with id "${id}" not found`);
    }

    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto): Promise<Meeting> {
    await this.findById(id);

    return this.prisma.meeting.update({
      where: { id },
      data: dto,
    });
  }

  async complete(id: string, dto: CompleteMeetingDto): Promise<Meeting> {
    await this.findById(id);

    return this.prisma.meeting.update({
      where: { id },
      data: {
        status: MeetingStatus.COMPLETED,
        completedAt: new Date(),
        duration: dto.duration,
        notes: dto.notes,
      },
    });
  }
}
