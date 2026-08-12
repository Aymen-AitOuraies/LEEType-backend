import { ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

const MAX_TRANSACTION_RETRIES = 3;

export async function runSerializable<T>(
  prisma: PrismaService,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: unknown) {
      const isWriteConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';

      if (!isWriteConflict) {
        throw error;
      }

      if (attempt === MAX_TRANSACTION_RETRIES) {
        throw new ServiceUnavailableException(
          'Could not update the attempt. Please try again',
        );
      }
    }
  }

  throw new ServiceUnavailableException(
    'Could not update the attempt. Please try again',
  );
}
