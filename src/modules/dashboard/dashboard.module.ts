import { Module } from '@nestjs/common';
import { DashBoardController } from './dashboard.controller';
import { AbstractDashBoardSvc } from './dashboard.abstract';
import { DashBoardService } from './dashboard.service';

@Module({
	imports: [],
	controllers: [DashBoardController],
	providers: [
		{
			provide: AbstractDashBoardSvc,
			useClass: DashBoardService
		}
	]
})
export class DashBoardModule {}
