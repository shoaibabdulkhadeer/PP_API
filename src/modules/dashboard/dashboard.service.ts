import { AppConfigService } from '@app/config/appconfig.service';
import { DatabaseService } from '@app/database/database.service';
import { AbstractAuthSqlDao } from '@app/database/mssql/abstract/auth.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractDashBoardSvc } from './dashboard.abstract';
import { AbstractDashBoardSqlDao } from '@app/database/mssql/abstract/dashboard.abstract';
import AppLogger from '@app/core/logger/app-logger';
import { messages } from '@app/shared/messages.shared';
import { JwtToken } from '../auth/models/jwt_token.model';

@Injectable()
export class DashBoardService implements AbstractDashBoardSvc {
	private readonly _dashboardDao: AbstractDashBoardSqlDao;

	constructor(
		readonly _dbSvc: DatabaseService,
		readonly _loggerSvc: AppLogger
	) {
		this._dashboardDao = _dbSvc.dashboardSqlTxn;
	}

	//#region get Employees Without Projects
	async getEmployeesWithoutProjectsSvc(DepartmentId: number, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._dashboardDao.getEmployeesWithoutProjects(DepartmentId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get Employees With Allocated Hours Less Than 8
	async getEmployeesWithAllocatedHoursLessThan8Svc(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesWithAllocatedHoursLessThan8(DepartmentId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get Employees With Allocated Hours greater Than 8
	async getEmployeesWithAllocatedHoursgreaterThan8Svc(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesWithAllocatedHoursgreaterThan8(DepartmentId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region find Employee By Id
	async findEmployeeByIdSvc(employeeId: string, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._dashboardDao.findEmployeeById(employeeId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  get employees rating service
	async getemployeesratingSvc(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesbyRating(DepartmentId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get employees billable and nonbillable service
	async geteEmployeesBillableNonbillable(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesbyWorkingHours(DepartmentId, month, year, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  get 9 box position employee
	async geteEmployees9BoxData(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesby9b0xdata(DepartmentId, month, year, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get last threemonth billable and non billable
	async getEmployeesMaxBillableHours(DepartmentId, claims: JwtToken): Promise<any> {
		try {
			return await this._dashboardDao.getEmployeesMaxBillableHours(DepartmentId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
