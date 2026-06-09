import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      findOneById: jest.fn(),
      create: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };
    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'jwt.refreshExpiration') return '604800s';
        return 'test_value';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.validateUser({ email: 'test@test.com', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = { email: 'test@test.com', passwordHash: 'hashed', isActive: true } as any;
      usersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser({ email: 'test@test.com', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user if password matches', async () => {
      const user = { email: 'test@test.com', passwordHash: 'hashed', isActive: true } as any;
      usersService.findOneByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({ email: 'test@test.com', password: 'password' });
      expect(result).toEqual(user);
    });
  });
});
