import { AttemptController } from './attempt.controller';
import { AttemptService } from './attempt.service';

describe('AttemptController', () => {
  const attemptService = {
    start: jest.fn(),
    finish: jest.fn(),
  };
  const controller = new AttemptController(
    attemptService as unknown as AttemptService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts an attempt for the authenticated user', async () => {
    await controller.start({ user: { id: 42 } });

    expect(attemptService.start).toHaveBeenCalledWith(42);
  });

  it('finishes an owned attempt with typed text', async () => {
    const dto = { attemptId: 8, typedText: 'typed text' };

    await controller.finish({ user: { id: 42 } }, dto);

    expect(attemptService.finish).toHaveBeenCalledWith(42, dto);
  });
});
