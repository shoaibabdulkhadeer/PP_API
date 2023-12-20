import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	status(): Promise<AppResponse> {
		return Promise.resolve(createResponse(200, messages.S2));
	}
}
