import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QAStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateQAReviewDto, UpdateQAReviewDto } from './dto';

@Injectable()
export class QAService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQAReviewDto) {
    return this.prisma.qAReview.create({ data: dto });
  }

  async findAll(pagination: PaginationDto, filters?: { reviewerId?: string; status?: QAStatus }) {
    const where: Prisma.QAReviewWhereInput = {};

    if (filters?.reviewerId) {
      where.reviewerId = filters.reviewerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.qAReview.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        include: { task: true, reviewer: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qAReview.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string) {
    const review = await this.prisma.qAReview.findUnique({
      where: { id },
      include: { task: true, reviewer: true },
    });

    if (!review) {
      throw new NotFoundException(`QA Review with id "${id}" not found`);
    }

    return review;
  }

  async findByTaskId(taskId: string) {
    const review = await this.prisma.qAReview.findUnique({
      where: { taskId },
      include: { task: true, reviewer: true },
    });

    if (!review) {
      throw new NotFoundException(`QA Review for task "${taskId}" not found`);
    }

    return review;
  }

  async update(id: string, dto: UpdateQAReviewDto) {
    await this.findById(id);

    return this.prisma.qAReview.update({
      where: { id },
      data: dto,
    });
  }
}
