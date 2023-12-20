import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppResponse } from '@app/shared/appresponse.shared';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Default')
@Controller()
export class AppController {
	constructor(private readonly _appService: AppService) {}

	@Get('status')
	status(): Promise<AppResponse> {
		return this._appService.status();
	}
}
