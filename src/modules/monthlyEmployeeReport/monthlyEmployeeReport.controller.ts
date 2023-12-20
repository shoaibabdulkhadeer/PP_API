import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, ValidationPipe } from '@nestjs/common';
import { AbstractEmpReportSvc } from './monthlyEmployeeReport.abstract';
import { Response } from 'express';
import { AddNewReportDto, BulkUploadDto, EditNewReportDto } from './dto/monthlyEmployeeReport.dto';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';

@Controller('empReport')
@ApiTags('Reports')
export class EmpReportController {
	constructor(private readonly reportService: AbstractEmpReportSvc) {}

	//#region getAllEmpReport
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Get('getEmpReport')
	async getAllReport(@Req() req: any, res: Response) {
		return await this.reportService.getAllEmpReportSvc(req.claims);
	}
	//#endregion

	//#region EditAllEmpReport
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Put('editEmpReport')
	editMonthReport(@Body(new ValidationPipe()) addingNewReport: EditNewReportDto, @Req() req: any) {
		return this.reportService.editEmpReportSvc(addingNewReport, req.claims);
	}
	//#endregion

	//#region Add-Emp-Report
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Post('addEmpReport')
	addNewMonthReport(@Body(new ValidationPipe()) addingNewReport: BulkUploadDto, @Req() req: any) {
		return this.reportService.addNewEmpMonthReportSvc(addingNewReport, req.claims);
	}
	//#endregion
	//#region getAllEmpNamesId
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Get('getEmpNames')
	async GetEmpNames(@Req() req: any) {
		const result = await this.reportService.getEmpNamesSvc(req.claims);

		return result;
	}
	//#endregion

	//#region Get-9box
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Get('get9box')
	async Get9boxModel() {
		const result = await this.reportService.get9boxModelSvc();
		return result;
	}

	//#endregion

	//#region exportMonthReport
	@Authorize()
	@HasRoles(RoleGroup.REPORTING_MANAGER)
	@Post('exportMonthReport')
	async exportMonthReport(@Body() date: { ForMonth: any }, @Req() Req: any, @Res() res: any) {
		const DaTe = date.ForMonth;

		const csvResp = await this.reportService.exportMonthReportSvc(DaTe, Req.claims);
		if (csvResp.code !== HttpStatus.OK) {
			return res.send(csvResp);
		}
		res.attachment(`Employee month Report-${unix_ts_now()}.csv`);
		return res.send(csvResp.data);
	}
	//#endregion
}
