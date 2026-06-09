import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ROLES_KEY } from '../src/auth/decorators/roles.decorator';
import { InvoicesController } from '../src/invoices/invoices.controller';
import { UsersController } from '../src/users/users.controller';
import { PrescriptionsController } from '../src/prescriptions/prescriptions.controller';

describe('Role-Based Access Control (RBAC) Verification', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('RolesGuard Logic', () => {
    const createMockContext = (userRole: string | null, requiredRoles: string[] | null): ExecutionContext => {
      const mockRequest = {
        user: userRole ? { role: { name: userRole } } : null,
      };

      // Mock Reflector returning the required roles
      reflector.getAllAndOverride = jest.fn().mockReturnValue(requiredRoles);

      return {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as any;
    };

    it('should allow access if no roles are required', () => {
      const context = createMockContext('patient', null);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should allow access if user is admin regardless of required roles', () => {
      const context = createMockContext('admin', ['doctor']);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has one of the required roles', () => {
      const context = createMockContext('doctor', ['admin', 'doctor']);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should block access if user does not have required roles', () => {
      const context = createMockContext('patient', ['admin', 'doctor']);
      expect(rolesGuard.canActivate(context)).toBe(false);
    });

    it('should block access if user has no role object', () => {
      const context = createMockContext(null, ['admin']);
      expect(rolesGuard.canActivate(context)).toBe(false);
    });
  });

  describe('Controller Decorator Enforcements', () => {
    // Helper to get Roles metadata from controller methods
    const getRolesMetadata = (controllerClass: any, methodName: string): string[] => {
      const reflectorInstance = new Reflector();
      const handler = controllerClass.prototype[methodName];
      return reflectorInstance.get<string[]>(ROLES_KEY, handler) || [];
    };

    it('should enforce admin-only on invoices summary', () => {
      const roles = getRolesMetadata(InvoicesController, 'getSummary');
      expect(roles).toEqual(['admin']);
    });

    it('should enforce receptionist or admin roles on manual invoice creation', () => {
      const roles = getRolesMetadata(InvoicesController, 'create');
      expect(roles).toContain('admin');
      expect(roles).toContain('receptionist');
      expect(roles).not.toContain('patient');
    });

    it('should restrict user/staff configuration endpoints to admin role', () => {
      const roles = getRolesMetadata(UsersController, 'create');
      expect(roles).toEqual(['admin']);
    });

    it('should restrict prescription creation to admin and doctor roles', () => {
      const roles = getRolesMetadata(PrescriptionsController, 'create');
      expect(roles).toContain('admin');
      expect(roles).toContain('doctor');
      expect(roles).not.toContain('patient');
    });

    it('should restrict prescription duplication to admin and doctor roles', () => {
      const roles = getRolesMetadata(PrescriptionsController, 'duplicate');
      expect(roles).toContain('admin');
      expect(roles).toContain('doctor');
      expect(roles).not.toContain('patient');
    });
  });
});
