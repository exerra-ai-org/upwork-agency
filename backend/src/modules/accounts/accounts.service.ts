import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateAccountDto, UpdateAccountDto } from './dto';
import { FreelanceAccount } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto): Promise<FreelanceAccount> {
    return this.prisma.freelanceAccount.create({
      data: dto,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<FreelanceAccount>> {
    const [data, total] = await Promise.all([
      this.prisma.freelanceAccount.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.freelanceAccount.count(),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<FreelanceAccount> {
    const account = await this.prisma.freelanceAccount.findUnique({
      where: { id },
      include: { agents: true },
    });

    if (!account) {
      throw new NotFoundException(`FreelanceAccount with id "${id}" not found`);
    }

    return account;
  }

  async update(id: string, dto: UpdateAccountDto): Promise<FreelanceAccount> {
    await this.findById(id);

    return this.prisma.freelanceAccount.update({
      where: { id },
      data: dto,
    });
  }
}
