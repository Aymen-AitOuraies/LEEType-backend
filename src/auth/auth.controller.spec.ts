import { UserService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('is created with its service dependencies', () => {
    const authService = {} as AuthService;
    const userService = {} as UserService;

    expect(new AuthController(authService, userService)).toBeDefined();
  });
});
