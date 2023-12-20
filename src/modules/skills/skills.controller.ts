import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { AbstractSkillSvc } from './skills.abstract';
import { messages } from '@app/shared/messages.shared';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkillsDto, UpdateSkillsDto } from './dto/skills.dto';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@ApiTags('Skills')
@ApiBearerAuth()
@Controller('skills')
export class SkillController {
	constructor(private readonly skillService: AbstractSkillSvc) {}

	//#region  get all skills
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get')
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	async getAllSkills(@Res() res: any, @Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
		const svcRes = await this.skillService.getAllSkillsSvc(page, limit, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region get all skillTags
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('skillTag')
	async getAllSkillTag(@Res() res: any, @Req() req: any) {
		const svcRes = await this.skillService.getAllSkillTagSvc(req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region adding skills
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Post('add')
	async addSkill(@Body() skillBody: SkillsDto, @Res() res: any, @Req() req: any) {
		const svcRes = await this.skillService.addSkillSvc(skillBody, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region update skill
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Put('update/:id')
	async updateSkill(@Body() skillBody: UpdateSkillsDto, @Param('id') id: string, @Res() res: any, @Req() req: any) {
		const svcRes = await this.skillService.updateSkillSvc(id, skillBody, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region disable skill
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('disable/:id')
	async disableSkill(@Param('id') id: string, @Res() res: any, @Req() req: any) {
		const svcRes = await this.skillService.disableSkillSvc(id, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion
}
