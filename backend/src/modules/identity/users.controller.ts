import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, Public } from '@/common/decorators';
import { PaginationDto } from '@/common/dto';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, InviteUserDto, AcceptInviteDto } from './dto';
import { InvitationsService } from './invitations.service';
import { CurrentUser } from '@/common/decorators';
import { JwtPayload } from '@/common/interfaces';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all users with pagination' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.usersService.findAll(pagination);
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all roles' })
  async listRoles() {
    return this.usersService.listRoles();
  }

  @Get('teams')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all teams' })
  async listTeams() {
    return this.usersService.listTeams();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List invitations (admin only)' })
  @ApiQuery({ name: 'organizationId', required: false })
  async listInvites(@Query('organizationId') organizationId?: string) {
    return this.invitationsService.listInvites(organizationId);
  }

  @Post('invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Invite a user via email (admin only)' })
  async invite(@Body() dto: InviteUserDto, @CurrentUser() user: JwtPayload) {
    return this.invitationsService.createInvite(dto, user.sub);
  }

  @Post('invites/:id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Resend an invitation email (admin only)' })
  async resendInvite(@Param('id', ParseUUIDPipe) id: string) {
    return this.invitationsService.resendInvite(id);
  }

  @Public()
  @Get('invites/:token')
  @ApiOperation({ summary: 'Get invitation details (public)' })
  async getInvite(@Param('token') token: string) {
    return this.invitationsService.getInvite(token);
  }

  @Public()
  @Post('invites/:token/accept')
  @ApiOperation({ summary: 'Accept invitation (public)' })
  async acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invitationsService.acceptInvite(token, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a user (admin only)' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
