import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (user) {
      const { password, ...safeUser } = user.toObject();
      return safeUser;
    }
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(@Req() request: Request, @Param('id') id: string, @Body() body: Partial<any>) {
    const user = request.user as any;
    if (user.userId !== id && user.role !== 'admin') {
      return { message: 'Not authorized' };
    }
    return this.usersService.update(id, body);
  }
}
