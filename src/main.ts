import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  // whitelist : removes properties not declared in the DTO.
  // transform : converts incoming values into their declared DTO types.
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
