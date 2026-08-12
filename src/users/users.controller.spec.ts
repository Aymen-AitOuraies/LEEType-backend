import { UserController } from './users.controller';
import { UserService } from './users.service';

describe('UserController', () => {
  it('is created with its service dependency', () => {
    const service = {} as UserService;

    expect(new UserController(service)).toBeDefined();
  });
});
