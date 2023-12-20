import { Module } from '@nestjs/common';
import { SkillController } from './skills.controller';
import { SkillService } from './skills.service';
import { AbstractSkillSvc } from './skills.abstract';

@Module({
	imports: [],
	controllers: [SkillController],
	providers: [
		{
			provide: AbstractSkillSvc,
			useClass: SkillService
		}
	]
})
export class SkillModule {}
