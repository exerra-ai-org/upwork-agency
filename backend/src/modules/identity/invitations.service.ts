import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { InviteUserDto, AcceptInviteDto } from './dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import type { Invitation, User } from '@prisma/client';
import { MailService } from '@/modules/mailer/mail.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailService,
  ) {}

  async createInvite(dto: InviteUserDto, invitedById?: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const existingInvite = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email,
        organizationId: dto.organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      throw new ConflictException('An active invite already exists for this email');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        roleId: dto.roleId,
        teamId: dto.teamId,
        organizationId: dto.organizationId,
        invitedById,
        expiresAt,
      },
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });

    await this.mailer.sendInviteEmail({
      to: invite.email,
      organizationName: invite.organization.name,
      roleName: invite.role.name,
      inviteToken: invite.token,
      teamName: invite.team?.name ?? undefined,
    });

    return invite;
  }

  async listInvites(organizationId?: string) {
    return this.prisma.invitation.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        invitedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvite(token: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  async acceptInvite(token: string, dto: AcceptInviteDto): Promise<Omit<User, 'passwordHash'>> {
    const invite = await this.getInvite(token);

    const existingUser = await this.prisma.user.findUnique({ where: { email: invite.email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: invite.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          roleId: invite.roleId,
          teamId: invite.teamId,
        },
        include: { role: true, team: true },
      });

      await tx.userOrganization.create({
        data: {
          userId: createdUser.id,
          organizationId: invite.organizationId,
        },
      });

      await tx.invitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return createdUser;
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async resendInvite(id: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    await this.mailer.sendInviteEmail({
      to: invite.email,
      organizationName: invite.organization.name,
      roleName: invite.role.name,
      inviteToken: invite.token,
      teamName: invite.team?.name ?? undefined,
    });

    return invite;
  }
}
