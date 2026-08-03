import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (passwordsMatch) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      name: user.name,
      email: user.email,
      userId: user._id,
    };
  }

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }
    const hashed = await bcrypt.hash(data.password, 10);
    return this.usersService.create({
      email: data.email,
      password: hashed,
      name: data.name,
      role: data.role || 'customer',
    });
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('No account found with that email');
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.usersService.update(user._id, { password: hashed });
  }
}
