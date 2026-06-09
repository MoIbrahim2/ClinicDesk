import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus, NotFoundException, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'roleId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query('search') search?: string,
    @Query('roleId') roleId?: number,
  ) {
    const users = await this.usersService.findAll({ search, roleId });
    return users.map((user) => {
      const { passwordHash, ...rest } = user;
      return rest;
    });
  }

  @Get('roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all database roles (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async findRoles() {
    return this.usersService.findRoles();
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new staff user account (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() createUserDto: any,
    @CurrentUser() adminUser: User,
    @Ip() ip: string,
  ) {
    const user = await this.usersService.create(createUserDto);
    const { passwordHash, ...rest } = user;
    await this.auditLogsService.logAction(adminUser.id, 'CREATE', 'user', user.id, null, rest, ip);
    return rest;
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user details (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: any,
    @CurrentUser() adminUser: User,
    @Ip() ip: string,
  ) {
    const oldUser = await this.usersService.findOneById(id);
    if (!oldUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const user = await this.usersService.update(id, updateUserDto);
    const { passwordHash: _, ...oldClean } = oldUser;
    const { passwordHash: __, ...updatedClean } = user;
    await this.auditLogsService.logAction(adminUser.id, 'UPDATE', 'user', id, oldClean, updatedClean, ip);
    return updatedClean;
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user account (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() adminUser: User,
    @Ip() ip: string,
  ) {
    const oldUser = await this.usersService.findOneById(id);
    if (!oldUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const updated = await this.usersService.update(id, { isActive: false });
    const { passwordHash: _, ...oldClean } = oldUser;
    const { passwordHash: __, ...updatedClean } = updated;
    await this.auditLogsService.logAction(adminUser.id, 'DELETE', 'user', id, oldClean, updatedClean, ip);
  }
}
