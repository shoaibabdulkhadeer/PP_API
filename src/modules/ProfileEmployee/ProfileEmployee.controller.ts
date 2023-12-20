import { AppResponse } from '@app/shared/appresponse.shared';
import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractProfileEmployeeSvc } from './ProfileEmployee.abstract';
import { CreateCertificationDto } from './dto/createCertification.dto';

// // For Azure file
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { patchSkillDto } from './dto/patchSkill.dto';
import { projectFetchDto } from './dto/projectFetch.dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileEmployeeController {
	constructor(private readonly _EmployeeSvc: AbstractProfileEmployeeSvc) {}

	// 1. Get an Employee's Details by EmployeeGuID -- CONTROLLER
	//#region 1. Get an Employee's Details by EmployeeGuID -- CONTROLLER
	@Authorize()
	@Get('employees')
	async getBasicInfo(@Req() req: any): Promise<AppResponse> {
		const profileEmployeeUser = await this._EmployeeSvc.getEmployeeDetailsById(req.claims.EmployeeGuID);
		return profileEmployeeUser;
	}
	//#endregion

	// 2. Get all projects for an Employee by EmployeeGuID -- CONTROLLER
	//#region 2. Get all projects for an Employee by EmployeeGuID -- CONTROLLER
	@Authorize()
	@Post('projects')
	@ApiQuery({ name: 'Project Name', required: false, type: String })
	@ApiQuery({ name: 'Page ID', required: false, type: Number })
	async getEmployeeProjects(
		@Req() req: any,
		@Body() projectFetchBody: projectFetchDto,
		@Query('Project Name') projectName?: string,
		@Query('Page ID') pageId: number = 1
	): Promise<AppResponse> {
		return await this._EmployeeSvc.getProjectsById(req.claims, projectFetchBody, projectName, pageId);
	}
	//#endregion

	// 3. Get an Employee Skills by EmployeeGuID -- CONTROLLER
	//#region 3. Get an Employee Skills by EmployeeGuID -- CONTROLLER
	@Authorize()
	@Get('skills')
	async getEmployeeSkill(@Req() req: any): Promise<AppResponse> {
		return await this._EmployeeSvc.getSkillsById(req.claims.EmployeeGuID);
	}
	//#endregion

	// 4. Patch an Employee's Skill self rating -- CONTROLLER
	//#region 4. Patch an Employee's Skill self rating -- CONTROLLER
	@Authorize()
	@Patch('patch-skill')
	@ApiBody({ type: patchSkillDto })
	async patchEmployeeSkill(@Body() patchBody: patchSkillDto, @Req() req: any): Promise<AppResponse> {
		return await this._EmployeeSvc.patchSkillById(patchBody, req.claims);
	}
	//#endregion

	// 5. Get all Certifiates -- CONTROLLER
	//#region 5. Get all Certificates -- CONTROLLER
	@Authorize()
	@Get('all-certifications')
	async getAllCertificates(): Promise<AppResponse> {
		return await this._EmployeeSvc.getAllCertificates();
	}
	//#endregion

	// 6. Get an Employee Certifiates by EmployeeGuID -- CONTROLLER
	//#region 5. Get all Certificates -- CONTROLLER
	@Authorize()
	@Get('certifications')
	async getEmployeeCertificates(@Req() req: any): Promise<AppResponse> {
		return await this._EmployeeSvc.getCertificatesById(req.claims.EmployeeGuID);
	}
	//#endregion

	// 7. Post an Employee Certifiation by EmployeeGuID -- CONTROLLER
	//#region 7. Post an Employee Certification by EmployeeGuID -- CONTROLLER
	@Authorize()
	@Post('post-certification')
	@ApiBody({ type: CreateCertificationDto })
	@UseInterceptors(FileInterceptor('pdf'))
	async postCertification(@UploadedFile() file: any, @Body() body: CreateCertificationDto, @Req() req: any) {
		return await this._EmployeeSvc.postCertificationById(file, body, req.claims);
	}
	//#endregion

	//8. Download an Employee's Certification  EmployeeGuID -- CONTROLLER
	//#region 8. Download an Employee's Certification by EmployeeGuID -- CONTROLLER
	@Authorize()
	@ApiProduces('application/pdf')
	@Post('download-certification')
	@ApiBody({ type: CreateCertificationDto })
	async downloadCertification(@Body() body: CreateCertificationDto, @Res() res: Response): Promise<any> {
		const file = await this._EmployeeSvc.downloadCertificationById(body);
		if (file.code) {
			return res.send(file);
		}
		file.pipe(res);
	}
	//#endregion

	// 9. Get an Employee Monthly Performance Report by EmployeeGuID -- CONTROLLER
	//#region 9. Get an Employee Monthly Performance Report by EmployeeGuID -- CONTROLLER
	@Authorize()
	@Get('report/:id')
	async getEmployeePerformanceReport(@Req() req: any, @Res() res: any, @Param('id') id: string): Promise<AppResponse> {
		const csvReportResponse = await this._EmployeeSvc.getEmployeePerformanceReportById(id);
		if (!csvReportResponse.data || csvReportResponse.data.length === 0) {
			return res.send(csvReportResponse);
		}
		res.attachment(`${id}.csv`);
		return res.send(csvReportResponse.data);
	}
	//#endregion
}
