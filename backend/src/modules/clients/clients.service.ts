import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountPlatform, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  async findAll(pagination: PaginationDto, search?: string, platform?: AccountPlatform) {
    const where: Prisma.ClientWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (platform) {
      where.platform = platform;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { proposals: true },
    });

    if (!client) {
      throw new NotFoundException(`Client with id "${id}" not found`);
    }

    return client;
  }

  async findByMarketplaceId(marketplaceId: string) {
    const client = await this.prisma.client.findFirst({
      where: { marketplaceId },
    });

    if (!client) {
      throw new NotFoundException(`Client with marketplaceId "${marketplaceId}" not found`);
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    // Ensure client exists before updating
    await this.findById(id);

    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }
}
