import * as compression from 'compression';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as requestContext from 'request-context';
import { mw } from 'request-ip';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';

import { RedisIoAdapter } from './adapter/redisIoAdapter';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { QueryFailedFilter } from './filters/query-failed.filter';
import { ConfigService } from './shared/services/config.service';
import { SharedModule } from './shared/shared.module';
import { setupSwagger } from './swagger';
import { ENVIRONMENTS } from './common/constants/constants';
import { Transport } from '@nestjs/microservices';

const config = new ConfigService();

if (config.nodeEnv === ENVIRONMENTS.PRODUCTION) require('newrelic');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;

async function bootstrap(): Promise<void> {
  try {
    initializeTransactionalContext();
    patchTypeORMRepositoryWithBaseRepository();

    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(),
      config.nodeEnv === ENVIRONMENTS.PRODUCTION
        ? {
            logger: ['error'],
          }
        : {},
    );
    app.useWebSocketAdapter(new RedisIoAdapter(app));

    app.use(requestContext.middleware('request'));
    app.use(mw());
    app.enableCors({
      origin: process.env.CLIENT_URL.split(',').map(url => {
        return url.match(/^\/.*\/$/)
          ? new RegExp(url.substring(1, url.length - 1))
          : url;
      }),
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    });

    // TODO: We can also use CSURF libraray to avoid request forgery
    /*
      var csurf = require('csurf');
      var csrfProtection = csurf({ cookie: true})
      app.use(cookieParser());

      for backend: https://github.com/expressjs/csurf
      for angular: https://github.com/expressjs/csurf#single-page-application-spa

      a medium article: https://medium.com/@d.silvas/how-to-implement-csrf-protection-on-a-jwt-based-app-node-csurf-angular-bb90af2a9efd
    */

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
          },
          browserSniff: false,
        },
      }),
    ); // TODO: for prod, need to add CSP https://helmetjs.github.io/docs/csp/

    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)

    app.use(compression());
    app.use(morgan('combined'));

    const reflector = app.get(Reflector);

    app.useGlobalFilters(
      new HttpExceptionFilter(reflector),
      new QueryFailedFilter(reflector),
    );

    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        dismissDefaultMessages: true,
        validationError: {
          target: false,
        },
      }),
    );

    const configService = app.select(SharedModule).get(ConfigService);

    if (['development', 'staging'].includes(configService.nodeEnv)) {
      setupSwagger(app);
    }

    // Starting it as a microservice as well.
    app.connectMicroservice({
      transport: Transport.REDIS,
      options: { url: configService.get('REDIS_URL') },
    });
    await app.startAllMicroservicesAsync();

    // Listening on http port.
    const port = configService.getNumber('PORT');
    await app.listen(port);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  } catch (e) {
    throw new Error(e);
  }
}

bootstrap();
