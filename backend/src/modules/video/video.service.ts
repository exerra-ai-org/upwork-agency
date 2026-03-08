import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateVideoProposalDto } from './dto';
import { VideoProposal } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVideoProposalDto): Promise<VideoProposal> {
    return this.prisma.videoProposal.create({
      data: dto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<VideoProposal>> {
    const [data, total] = await Promise.all([
      this.prisma.videoProposal.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: { proposal: true },
      }),
      this.prisma.videoProposal.count(),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<VideoProposal> {
    const video = await this.prisma.videoProposal.findUnique({
      where: { id },
      include: { proposal: true },
    });

    if (!video) {
      throw new NotFoundException(`VideoProposal with id "${id}" not found`);
    }

    return video;
  }

  async findByProposalId(proposalId: string): Promise<VideoProposal> {
    const video = await this.prisma.videoProposal.findUnique({
      where: { proposalId },
      include: { proposal: true },
    });

    if (!video) {
      throw new NotFoundException(`VideoProposal for proposal "${proposalId}" not found`);
    }

    return video;
  }

  async incrementViewCount(id: string): Promise<VideoProposal> {
    const video = await this.prisma.videoProposal.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`VideoProposal with id "${id}" not found`);
    }

    return this.prisma.videoProposal.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  async delete(id: string): Promise<VideoProposal> {
    const video = await this.prisma.videoProposal.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`VideoProposal with id "${id}" not found`);
    }

    return this.prisma.videoProposal.delete({
      where: { id },
    });
  }

  getUploadUrl(fileName: string): { storageKey: string; uploadUrl: string } {
    const key = `videos/${randomUUID()}/${fileName}`;
    const uploadUrl = `https://s3.amazonaws.com/your-bucket/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600`;

    return {
      storageKey: key,
      uploadUrl,
    };
  }
}
