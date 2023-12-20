import { INestApplication, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

import { AppConfigService } from '@app/config/appconfig.service';
import { corsOptions } from './cors.config';

import { setupSwagger } from './swagger/doc.swagger';
import AppLogger from './logger/app-logger';
import { shouldCompress } from './compressions/compression';
import { ErrorHandler, ResponseHandler } from '@app/core/middleware';
import * as compression from 'compression';
import * as cors from 'cors';
import helmet from 'helmet';

/**
 * Core bootstrap module should be loaded here.
 * @param app
 *
 */

export default async function bootstrap(app: INestApplication, configObj: AppConfigService) {
	// Global Prefix
	app.setGlobalPrefix('api');

	// middlewares, express specific
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ limit: '50mb', extended: true }));
	app.use(helmet());
	app.use(
		compression({
			filter: shouldCompress,
			threshold: 0
		})
	);

	// CORS configuration
	app.use(cors(corsOptions));

	/*Global validation filters*/
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true
		})
	);

	// Bind Interceptors
	app.useGlobalInterceptors(new ResponseHandler());

	// Error Handler
	app.useGlobalFilters(new ErrorHandler(app.get(AppLogger)));

	//Swagger document
	const appConfig = configObj.get('app'),
		{ environment } = appConfig;
	if (environment.toLowerCase() !== 'production') {
		setupSwagger(app);
	}
}
