import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
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

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', expect.any(Object));
      expect(result).toEqual({ accessToken: 'access', user });
    });
  });
});
