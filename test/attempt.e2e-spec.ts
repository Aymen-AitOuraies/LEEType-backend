import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AttemptController } from '../src/attempt/attempt.controller';
import { AttemptService } from '../src/attempt/attempt.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../src/auth/types/authenticated-request.type';

describe('Attempt lifecycle routes (e2e)', () => {
  const attemptService = {
    start: jest.fn(),
    finish: jest.fn(),
  };
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AttemptController],
      providers: [
        {
          provide: AttemptService,
          useValue: attemptService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const authenticatedRequest = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
          authenticatedRequest.user = { id: 42 };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts an attempt for the authenticated user', async () => {
    attemptService.start.mockResolvedValue({
      attemptId: 8,
      startedAt: new Date('2026-08-12T12:00:00.000Z'),
      expiresAt: new Date('2026-08-12T12:00:30.000Z'),
      durationSeconds: 30,
      attemptsRemaining: 2,
      recoveredExpiredAttempt: false,
      resumedActiveAttempt: false,
    });

    const response = await request(server).post('/attempts/start').expect(201);

    expect(attemptService.start).toHaveBeenCalledWith(42);
    expect(response.body).toMatchObject({
      attemptId: 8,
      startedAt: '2026-08-12T12:00:00.000Z',
      expiresAt: '2026-08-12T12:00:30.000Z',
      durationSeconds: 30,
    });
  });

  it('finishes using attempt identity and typed text', async () => {
    attemptService.finish.mockResolvedValue({
      completed: true,
      completedText: false,
      timerExpired: true,
      durationMs: 30_000,
      wpm: 70,
      accuracy: 95.5,
      bestWpm: 70,
      bestAccuracy: 95.5,
      attemptsUsed: 1,
      attemptsRemaining: 2,
    });

    await request(server)
      .post('/attempts/finish')
      .send({ attemptId: 8, typedText: 'typing passage' })
      .expect(201);

    expect(attemptService.finish).toHaveBeenCalledWith(42, {
      attemptId: 8,
      typedText: 'typing passage',
    });
  });

  it('rejects the removed client-calculated score contract', async () => {
    await request(server)
      .post('/attempts/finish')
      .send({ wpm: 100, accuracy: 100 })
      .expect(400);

    expect(attemptService.finish).not.toHaveBeenCalled();
  });
});
