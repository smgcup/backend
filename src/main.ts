import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { ApplicationExceptionFilter } from './exception/application-exception.filter';
import * as bodyParser from 'body-parser';

const httpLogger = new Logger('HTTP');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.84:3000',
        'https://frontend-rebuild-six.vercel.app',
        'https://www.smgcup.com',
      ],
      credentials: true,
    },
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Log every request (include GraphQL operation name when present)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    let msg = `${req.method} ${req.url}`;
    if (req.method === 'POST' && req.url === '/graphql' && req.body) {
      const body = req.body as { operationName?: string; query?: string };
      const op = body.operationName ?? body.query?.match(/^\s*(query|mutation)\s+(\w+)/)?.[2];
      if (op) msg += ` ${op}`;
    }
    httpLogger.debug(msg);
    next();
  });

  // Register global exception filter
  app.useGlobalFilters(new ApplicationExceptionFilter());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
void bootstrap();
