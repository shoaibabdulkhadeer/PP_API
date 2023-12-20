import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { AbstractEmployeeSvc } from './employee.abstract';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/employee.dto';
import { messages } from '@app/shared/messages.shared';
import { UpdateEmployeeDto } from './dto/employeeupdate.dto';
import { AddSkillDto, PatchSkillRatingDto } from './dto/skill.dto';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@Controller('employee')
@ApiBearerAuth()
@ApiTags('Employee')
export class EmployeeController {
	constructor(private readonly _EmployeeSvc: AbstractEmployeeSvc) {}

	//#region Get API for fetching employees
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('fetchemployees')
	@ApiQuery({ name: 'fullName', required: false, type: String })
	@ApiQuery({ name: 'departmentName', required: false, type: String })
	@ApiQuery({ name: 'designationName', required: false, type: String })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	async getBasicInfo(
		@Req() req: any,
		@Query('fullName') fullName?: string,
		@Query('departmentName') departmentName?: string,
		@Query('designationName') designationName?: string,
		@Query('page') page = 1,
		@Query('limit') limit = 10
	): Promise<AppResponse> {
		const getAllUsersResponse = await this._EmployeeSvc.getAllUsers(fullName, departmentName, designationName, page, limit, req.claims);
		return getAllUsersResponse;
	}
	//#endregion

	//#region Post Api for Registration
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Post('post-employees')
	async postBasicInfo(@Req() req: any, @Body() infoDetails: CreateEmployeeDto): Promise<AppResponse> {
		return await this._EmployeeSvc.addBasicInfo(infoDetails, req.claims);
	}
	//#endregion

	//#region Update Employee API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Put('update-employees/:id')
	async UpdateBasicInfo(@Param('id') id: string, @Body() infoDetails: UpdateEmployeeDto, @Req() req: any): Promise<AppResponse> {
		return await this._EmployeeSvc.updateBasicInfo(id, infoDetails, req.claims);
	}
	//#endregion

	//#region Status Update API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('status-update/:id')
	async StatusBasicInfo(@Param('id') id: string, @Req() req: any): Promise<AppResponse> {
		return await this._EmployeeSvc.statusBasicInfo(id, req.claims);
	}
	//#endregion

	//#region Employee Projects on basis of ID
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN_EMP)
	@Get('employee-projects/:id')
	async getEmpProjects(@Param('id') id: string) {
		try {
			const projects = await this._EmployeeSvc.getEmpProjects(id);
			return projects;
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region finding employee skills
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('Fetchskills/:employeeId')
	async getEmployeeDetails(@Param('employeeId') employeeId: string, @Req() req: any): Promise<AppResponse> {
		return this._EmployeeSvc.findEmployeeByIdSvcc(employeeId, req.claims);
	}
	//#endregion

	//#region deactivating skill of an employee
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('DeactivateSkill/:SkillMappingGuId')
	async deleteSkillMapping(@Param('SkillMappingGuId') SkillMappingGuId: string, @Req() req: any) {
		return this._EmployeeSvc.deleteSkillMappingSvc(SkillMappingGuId, req.claims);
	}
	//#endregion

	//#region adding new skill to an employee
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Post('Addskill/:employeeGuID')
	async addSkillToEmployee(@Param('employeeGuID') employeeGuID: string, @Body() addSkillDto: AddSkillDto, @Req() req: any) {
		return this._EmployeeSvc.addSkillToEmployeeSvc(employeeGuID, addSkillDto, req.claims);
	}
	//#endregion

	//#region updating rm rating for an employee
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('RmRating/:SkillMappingGuId')
	async patchSkillRating(@Param('SkillMappingGuId') SkillMappingGuId: string, @Body() patchDto: PatchSkillRatingDto, @Req() req: any) {
		const skillMapping = await this._EmployeeSvc.patchSkillRating(SkillMappingGuId, patchDto, req.claims);
		return skillMapping;
	}
	//#endregion
}
