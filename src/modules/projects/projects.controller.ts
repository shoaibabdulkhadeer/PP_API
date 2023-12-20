import { messages } from '@app/shared/messages.shared';
import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Put, Query, Req, Res } from '@nestjs/common';
import { AbstractProjectsSvc } from './projects.abstract';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsDto, UpdateProjectsDto } from './dto/projects.dto';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
	constructor(private readonly projectsService: AbstractProjectsSvc) {}

	//#region get all projects
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get')
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	async getAllProjects(@Res() res: any, @Req() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
		const ans = await this.projectsService.getAllProjectsSvc(page, limit, req.claims);
		res.status(ans.code).send(ans);
	}
	//#endregion

	//#region adding project
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Post('add')
	async addProject(@Body() projectBody: ProjectsDto, @Res() res: any, @Req() req: any) {
		const svcRes = await this.projectsService.addProjectSvc(projectBody, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region update project
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Put('update/:id')
	async updateProject(@Body() projectBody: UpdateProjectsDto, @Res() res: any, @Param('id') id: string, @Req() req: any) {
		const svcRes = await this.projectsService.updateProjectSvc(id, projectBody, req.claims);
		res.status(svcRes.code).send(svcRes);
	}
	//#endregion

	//#region get all Employees
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('employees')
	async getAllEmployees(@Res() res: any, @Req() req: any) {
		const ans = await this.projectsService.getAllEmployeesSvc(req.claims);
		res.status(ans.code).send(ans);
	}
	//#endregion
}
