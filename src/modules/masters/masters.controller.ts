import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponse } from '@app/shared/appresponse.shared';
import { AbstractMasterSvc } from './master.abstract';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@Controller('masters')
@ApiBearerAuth()
@ApiTags('Masters')
export class MastersersController {
	constructor(private readonly _MasterSvc: AbstractMasterSvc) {}

	//#region Get Departments API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN_EMP)
	@Get('departments')
	async getDepartments(): Promise<AppResponse> {
		const departments = await this._MasterSvc.getDepartmentSvc();
		return departments;
	}
	//#endregion

	//#region Get Designation API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('designation')
	async getDesignation(): Promise<AppResponse> {
		const departments = await this._MasterSvc.getDesignationSvc();
		return departments;
	}
	//#endregion

	//#region Get Reporting Managers API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('reporting-managers')
	async getUsersRoleRm(): Promise<AppResponse> {
		return await this._MasterSvc.getUsersRoleRmSvc();
	}
	//#endregion

	//#region Get Additional Roles API
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get-roles')
	async getAdditonalRoles(): Promise<AppResponse> {
		const AdditonalRoles = await this._MasterSvc.getAdditonalRolesSvc();
		return AdditonalRoles;
	}
	//#endregion

	//#region get skills Master Table
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get-skills')
	async getSkills(): Promise<AppResponse> {
		const getallskills = await this._MasterSvc.getAllSkillsSvc();
		return getallskills;
	}
	//#endregion

	//#region
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get-certificates')
	async getCertificates(): Promise<AppResponse> {
		const getallskills = await this._MasterSvc.getAllCertificatesSvc();
		return getallskills;
	}
	//#endregion
}
