import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      getFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should validate user, generate tokens, set cookie and return tokens', async () => {
      const user = { id: 1, email: 'test@test.com' } as any;
      const loginDto = { email: 'test@test.com', password: 'password' };
      const tokensResult = { accessToken: 'access', refreshToken: 'refresh', user };

      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue(tokensResult);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await controller.login(loginDto, mockResponse, '127.0.0.1');

      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', expect.any(Object));
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        user.id,
        'LOGIN',
        'user',
        user.id,
        null,
        null,
        '127.0.0.1',
      );
      expect(result).toEqual({ accessToken: 'access', user });
    });
  });
});
