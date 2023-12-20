import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { AbstractProjectsSvc } from './projects.abstract';
import { ProjectsService } from './projects.service';
import { DatabaseService } from '@app/database/database.service';

@Module({
	imports: [],
	controllers: [ProjectsController],
	providers: [
		{
			provide: AbstractProjectsSvc,
			useClass: ProjectsService
		}
	]
})
export class ProjectsModule {}
