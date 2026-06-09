import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    
    const accessToken = this.jwtService.sign(payload);
    
    // Sign refresh token with longer expiration
    const refreshExpiration = this.configService.get<string | number>('jwt.refreshExpiration') || '604800s';
    const parsedRefreshExpiration = typeof refreshExpiration === 'string' && /^\d+$/.test(refreshExpiration)
      ? parseInt(refreshExpiration, 10)
      : refreshExpiration;
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: parsedRefreshExpiration as any },
    );

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async register(registerDto: RegisterDto) {
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      firstNameAr: registerDto.firstNameAr,
      lastNameAr: registerDto.lastNameAr,
      phone: registerDto.phone,
      preferredLanguage: registerDto.preferredLanguage || 'en',
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findOneById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or not found');
      }

      // Generate new tokens (rotation)
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
