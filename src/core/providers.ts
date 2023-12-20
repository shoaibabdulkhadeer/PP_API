import { AppConfigService } from '@app/config/appconfig.service';
import { ConfigModule } from '@nestjs/config';
import AppLogger from './logger/app-logger';
import { AbstractAuthSvc } from '@app/modules/auth/auth.abstract';
import { AuthService } from '@app/modules/auth/auth.service';
import { DatabaseModule } from '@app/database/database.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/authorization.guard';
import { RolesGuard } from './guards/roles.guard';

const getProviders = (): any[] => {
		return [
			AppConfigService,
			AppLogger,
			{ provide: APP_GUARD, useClass: AuthGuard },
			{ provide: APP_GUARD, useClass: RolesGuard },
			{ provide: AbstractAuthSvc, useClass: AuthService },
			JwtService
		];
	},
	importProviders = (): any[] => {
		return [ConfigModule.forRoot(), DatabaseModule];
	},
	exportProviders = (): any[] => {
		return [AppConfigService, AppLogger, DatabaseModule];
	};
export { exportProviders, getProviders, importProviders };
