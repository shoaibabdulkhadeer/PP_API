import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/modules/app/app.module';
import { AppConfigService } from '@app/config/appconfig.service';
import Applogger from '@app/core/logger/app-logger';
import { messageFactory, messages } from '@app/shared/messages.shared';
import coreBootstrap from '@app/core/bootstrap';

async function bootstrap() {
	const app = await NestFactory.create(AppModule),
		configObj = app.get(AppConfigService),
		logger = app.get(Applogger),
		appConfig = configObj.get('app'),
		{ Performance_Api_Port } = appConfig;

	try {
		// core Bootstrap function to attach error handling middlewares, filters, pipes, cors, etc		coreBootstrap(app, configObj);
		coreBootstrap(app, configObj);
		await app.listen(Performance_Api_Port, () => {
			const successMsg = messageFactory(messages.S1, [Performance_Api_Port]);
			logger.log(successMsg, 200);
		});
	} catch (errorRunningServer) {
		const errMsg = messageFactory(messages.E1);
		logger.error(errMsg, 500);
	}
}
bootstrap();
