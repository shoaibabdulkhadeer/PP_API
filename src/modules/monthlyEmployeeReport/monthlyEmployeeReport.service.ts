import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractEmpReportSvc } from './monthlyEmployeeReport.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { AbstractEmpReportSqlDao } from '@app/database/mssql/abstract/monthlyEmployeeReport.abstract';
import { DatabaseService } from '@app/database/database.service';
import { EditMonthlyPerformanceInfo, MonthlyPerformanceInfo } from '@app/shared/models.shared';
import { stringify } from 'csv-stringify';
import { promisify } from 'util';
import { messages } from '@app/shared/messages.shared';
import { v4 as uuidv4 } from 'uuid';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { JwtToken } from '../auth/models/jwt_token.model';

const stringifyAsync: any = promisify(stringify);

@Injectable()
export class EmpReportService implements AbstractEmpReportSvc {
	private readonly _empReportDao: AbstractEmpReportSqlDao;

	constructor(readonly _dbSvc: DatabaseService) {
		this._empReportDao = _dbSvc.empReportSqlTxn;
	}

	//#region Get all Emp month report
	async getAllEmpReportSvc(claims: JwtToken): Promise<AppResponse> {
		const getAllEmpReportDao = await this._empReportDao.getAllEmpReport(claims);

		return getAllEmpReportDao;
	}
	//#endregion

	//#region edit Emp month report
	async editEmpReportSvc(editingReport: any, claims: JwtToken): Promise<AppResponse> {
		const currentDate = unix_ts_now();

		editingReport.UpdatedAt = currentDate;
		editingReport.UpdatedBy = claims.EmployeeGuID;
		const editEmpReportDao = await this._empReportDao.editEmpReport(editingReport, claims);
		return editEmpReportDao;
	}
	//#endregion

	//#region addNewEmpMonthReport
	async addNewEmpMonthReportSvc(data: { reports: MonthlyPerformanceInfo[] }, claims: JwtToken): Promise<AppResponse> {
		const currentDate = unix_ts_now();

		for (const report of data.reports) {
			report.CreatedAt = currentDate;
			report.CreatedBy = claims.EmployeeGuID;
			report.MonthlyPerformanceInfoGuId = uuidv4();
		}

		const editEmpReportDao = await this._empReportDao.addNewEmpMonthReport(data.reports);
		return editEmpReportDao;
	}

	//#endregion

	//#region addNewEmpMonthReport
	async getEmpNamesSvc(claims: JwtToken): Promise<AppResponse> {
		const editEmpReportDao = await this._empReportDao.getEmpNames(claims);

		return editEmpReportDao;
	}
	//#endregion

	//#region addNewEmpMonthReport
	async get9boxModelSvc(): Promise<AppResponse> {
		const editEmpReportDao = await this._empReportDao.get9boxModel();
		return editEmpReportDao;
	}
	//#endregion

	//#region exportMonthReportSvc
	async exportMonthReportSvc(date: any, claims: JwtToken): Promise<AppResponse> {
		try {
			const exportMonthReportDao = await this._empReportDao.exportMonthReport(date, claims);

			const csvData = [['EmployeeName', 'BillableHours', 'Non-BillableHours', '9-Box Position', 'Remarks']];
			const { data } = exportMonthReportDao;

			const rearrangedArray = data.map((item) => ({
				FullName: item.FullName,
				'monthlyperMappings.BillableHours': item['monthlyperMappings.BillableHours'],
				'monthlyperMappings.NonBillableHours': item['monthlyperMappings.NonBillableHours'],
				'monthlyperMappings.PositionIdInfo.BoxName': item['monthlyperMappings.PositionIdInfo.BoxName'],
				'monthlyperMappings.Remarks': item['monthlyperMappings.Remarks']
			}));
			const emptyData = rearrangedArray.map((employee: any) => {
				csvData.push(Object.values(employee));
				return ' ';
			});
			const stringifydata = await stringifyAsync(csvData);
			return createResponse(HttpStatus.OK, messages.S41, stringifydata);
		} catch (error) {
			return createResponse(HttpStatus.OK, messages.E2);
		}
	}
	//#endregion
}
