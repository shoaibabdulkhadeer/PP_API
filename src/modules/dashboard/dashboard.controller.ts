import { Controller, Get, HttpStatus, Param, Query, Req } from '@nestjs/common';
import { AbstractDashBoardSvc } from './dashboard.abstract';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { Authorize } from '@app/core/decorators/authorization.decorator';

@Controller('dashboard')
@ApiTags('Dashboard')
@ApiBearerAuth()
export class DashBoardController {
	constructor(private readonly _dashboardService: AbstractDashBoardSvc) {}

	//#region allocation-summary
	@ApiBearerAuth()
	@Authorize()
	@Get('allocation-summary')
	async getAllocationSummary(@Query('DepartmentId') departmentId: number, @Req() req: any): Promise<AppResponse> {
		const onBench = await this._dashboardService.getEmployeesWithoutProjectsSvc(departmentId, req.claims);
		const allocatedHoursLt8 = await this._dashboardService.getEmployeesWithAllocatedHoursLessThan8Svc(departmentId, req.claims);
		const allocatedHoursGt8 = await this._dashboardService.getEmployeesWithAllocatedHoursgreaterThan8Svc(departmentId, req.claims);
		return createResponse(HttpStatus.OK, messages.S29, {
			OnBench: onBench,
			AllocationHourslt8: allocatedHoursLt8,
			AllocationHoursgte8: allocatedHoursGt8
		});
	}
	//#endregion

	//#region @Get based on employeeid
	@Authorize()
	@Get('employees/:employeeId')
	async getEmployeeDetails(@Param('employeeId') employeeId: string, @Req() req: any): Promise<AppResponse> {
		return this._dashboardService.findEmployeeByIdSvc(employeeId, req.claims);
	}
	//#endregion

	//#region average rating of employee
	@Authorize()
	@Get('skillsRating')
	getemployeesrating(@Query('DepartmentId') DepartmentId: number, @Req() req: any) {
		return this._dashboardService.getemployeesratingSvc(DepartmentId, req.claims);
	}
	//#endregion

	//#region billable and non billale hours of employee
	@Authorize()
	@Get('workingHours')
	getEmployeBillableandNonbillableHours(
		@Query('DepartmentId') DepartmentId: number,
		@Query('Month') month: number,
		@Query('Year') year: number,
		@Req() req: any
	) {
		return this._dashboardService.geteEmployeesBillableNonbillable(DepartmentId, month, year, req.claims);
	}
	//#endregion

	//#region nine box position for each employee
	@Authorize()
	@Get('9boxPosition')
	getEmployein9box(@Query('DepartmentId') DepartmentId: number, @Query('Month') month: number, @Query('Year') year: number, @Req() req: any) {
		return this._dashboardService.geteEmployees9BoxData(DepartmentId, month, year, req.claims);
	}
	//#endregion

	//#region for getting 3month billable hours
	@Authorize()
	@Get('MaxBillableHoursPreviousMonth')
	getEmployeesMaxBillableHours(@Query('DepartmentId') DepartmentId: number, @Req() req: any) {
		return this._dashboardService.getEmployeesMaxBillableHours(DepartmentId, req.claims);
	}
	//#endregion
}
