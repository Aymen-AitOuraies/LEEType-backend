import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Attempt submission (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;
  let challengeId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    const user = await prisma.user.create({
      data: {
        login: `attempt-test-${Date.now()}`,
        campus: 'Rabat',
        avatarUrl: 'https://example.com/avatar.png',
      },
    });

    const challenge = await prisma.dailyChallenge.create({
      data: {
        text: 'End-to-end typing passage',
        date: new Date('2099-01-01'),
        maxAttempts: 3,
      },
    });

    userId = user.id;
    challengeId = challenge.id;
  });

  afterAll(async () => {
    await prisma.attempt.deleteMany({
      where: { userId },
    });

    await prisma.dailyChallenge.delete({
      where: { id: challengeId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  it('creates the first attempt with decimal accuracy', async () => {
    const response = await request(app.getHttpServer())
      .post('/attempts')
      .send({
        userId,
        challengeId,
        wpm: 70,
        accuracy: 95.5,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      userId,
      challengeId,
      attemptsUsed: 1,
      wpm: 70,
      accuracy: 95.5,
    });
  });

  it('counts a worse result without replacing the best score', async () => {
    const response = await request(app.getHttpServer())
      .post('/attempts')
      .send({
        userId,
        challengeId,
        wpm: 60,
        accuracy: 99,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      attemptsUsed: 2,
      wpm: 70,
      accuracy: 95.5,
    });
  });

  it('replaces the stored result when WPM is better', async () => {
    const response = await request(app.getHttpServer())
      .post('/attempts')
      .send({
        userId,
        challengeId,
        wpm: 80,
        accuracy: 92.5,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      attemptsUsed: 3,
      wpm: 80,
      accuracy: 92.5,
    });
  });

  it('rejects submissions after the attempt limit', async () => {
    const response = await request(app.getHttpServer())
      .post('/attempts')
      .send({
        userId,
        challengeId,
        wpm: 100,
        accuracy: 100,
      })
      .expect(400);

    expect(response.body.message).toBe(
      'Maximum number of attempts has been reached',
    );
  });
});
