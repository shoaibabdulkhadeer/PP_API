import { Module } from '@nestjs/common';

import { MastersersController } from './masters.controller';
import { AbstractMasterSvc } from './master.abstract';
import { MastersService } from './masters.service';

@Module({
	controllers: [MastersersController],

	providers: [
		{
			provide: AbstractMasterSvc,
			useClass: MastersService
		}
	]
})
export class MastersModule {}
