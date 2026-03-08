import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateScriptDto, CreateVersionDto } from './dto';
import { Script, ScriptVersion } from '@prisma/client';

@Injectable()
export class ScriptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScriptDto, userId: string): Promise<Script> {
    const { content, ...scriptData } = dto;

    return this.prisma.script.create({
      data: {
        ...scriptData,
        createdById: userId,
        versions: {
          create: {
            content,
            version: 1,
          },
        },
      },
      include: { versions: true },
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<Script>> {
    const [data, total] = await Promise.all([
      this.prisma.script.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.script.count(),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Script> {
    const script = await this.prisma.script.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!script) {
      throw new NotFoundException(`Script with id "${id}" not found`);
    }

    return script;
  }

  async createVersion(scriptId: string, dto: CreateVersionDto): Promise<ScriptVersion> {
    await this.findById(scriptId);

    const latestVersion = await this.prisma.scriptVersion.findFirst({
      where: { scriptId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = (latestVersion?.version ?? 0) + 1;

    return this.prisma.scriptVersion.create({
      data: {
        scriptId,
        content: dto.content,
        version: nextVersion,
      },
    });
  }

  async getVersion(scriptId: string, versionNumber: number): Promise<ScriptVersion> {
    const version = await this.prisma.scriptVersion.findUnique({
      where: {
        scriptId_version: {
          scriptId,
          version: versionNumber,
        },
      },
    });

    if (!version) {
      throw new NotFoundException(`Version ${versionNumber} of script "${scriptId}" not found`);
    }

    return version;
  }
}
