import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { loadEnv, redactedEnv, resolveCorsOrigins } from './config/env';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const env = loadEnv();
  logger.log(`Starting revendo-api (NODE_ENV=${env.NODE_ENV})`);
  logger.debug(`Non-secret config: ${JSON.stringify(redactedEnv({ ...process.env, SESSION_SECRET: undefined }))}`);

  const app = await NestFactory.create(AppModule, { bufferLogs: true, logger: ['log', 'error', 'warn'] });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(helmet());
  app.enableCors({
    origin: resolveCorsOrigins(env),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(env.API_PORT, '0.0.0.0');
  logger.log(`Listening on port ${env.API_PORT}`);
}

// Only auto-boot when executed directly (importable for tests).
if (require.main === module) {
  void bootstrap();
}

export { bootstrap };
