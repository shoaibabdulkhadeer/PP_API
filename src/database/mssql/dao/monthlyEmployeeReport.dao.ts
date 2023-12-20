import { EmpReportService } from './../../../modules/monthlyEmployeeReport/monthlyEmployeeReport.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constants.mssql';
import { AbstractEmpReportSqlDao } from '../abstract/monthlyEmployeeReport.abstract';
import { Sequelize } from 'sequelize';
import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { TblMonthlyPerformanceInfo } from '../models/employees.monthly-performance-info.models';
import { Tbl9BoxPositions } from '../models/readonly.9box-positions.models';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { create } from 'domain';
import { EditMonthlyPerformanceInfo, UpdateMonthlyPerformanceInfo } from '@app/shared/models.shared';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { log } from 'console';

@Injectable()
export class EmpReportSqlDao implements AbstractEmpReportSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		readonly _loggerSvc: AppLogger,
		@Inject(MsSqlConstants.EMPLOYEES_MONTHLY_PERFORMANCE_INFO_MODEL)
		private _empMonthReport: typeof TblMonthlyPerformanceInfo,
		@Inject(MsSqlConstants.READONLY_9BOX_POSITIONS_MODEL)
		private _9Box: typeof Tbl9BoxPositions,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL)
		private _empBasicInfo: typeof TblBasicInfo
	) {}

	//#region Get all Employee Report
	async getAllEmpReport(claims: JwtToken): Promise<AppResponse> {
		try {
			const find = await this._empBasicInfo.findAll({
				where: {
					EmployeeGuID: claims.EmployeeGuID
				}
			});
			if (!find) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W42);
			}

			const result = await this._empMonthReport.findAll({
				attributes: ['MonthlyPerformanceInfoGuId', 'EmployeeGuID', 'BillableHours', 'NonBillableHours', 'PositionId', 'Remarks', 'ForMonth'],
				where: {
					CreatedBy: claims.EmployeeGuID
				},
				order: [['ForMonth', 'ASC']]
			});

			if (result && result.length) {
				return createResponse(HttpStatus.OK, messages.S45, result);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W43);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Edit Employee Report
	async editEmpReport(editData: UpdateMonthlyPerformanceInfo, claims: JwtToken): Promise<AppResponse> {
		try {
			const find = await this._empBasicInfo.findOne({
				where: {
					EmployeeGuID: claims.EmployeeGuID
				}
			});
			if (!find) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W42);
			}

			await this._empMonthReport.update(editData, {
				where: { MonthlyPerformanceInfoGuId: editData.MonthlyPerformanceInfoGuId, CreatedBy: claims.EmployeeGuID }
			});

			return createResponse(HttpStatus.OK, messages.S48);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Add New Employee Month Report
	async addNewEmpMonthReport(addingNewReport: any): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const Rm = addingNewReport[0].CreatedBy;
			const forMonthValue = addingNewReport[0].ForMonth;
			const find = await this._empMonthReport.findOne({
				where: {
					ForMonth: forMonthValue,
					CreatedBy: Rm
				}
			});
			if (!find) {
				await this._empMonthReport.bulkCreate(addingNewReport);
				await transaction.commit();
				return createResponse(HttpStatus.OK, messages.S46);
			}

			return createResponse(HttpStatus.BAD_REQUEST, messages.W44);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Get Employee Names
	async getEmpNames(claims: JwtToken): Promise<AppResponse> {
		try {
			const empNames = await this._empBasicInfo.findAll({
				attributes: ['FullName', 'EmployeeGuID'],
				where: {
					ReportingManagerEmployeeGuID: claims.EmployeeGuID,
					IsActive: '1'
				}
			});

			if (empNames && empNames.length > 0) {
				return createResponse(HttpStatus.OK, messages.S47, empNames);
			}
			return createResponse(HttpStatus.BAD_REQUEST, messages.W31);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	//#region Get 9Box Model
	async get9boxModel(): Promise<AppResponse> {
		try {
			const result = await this._9Box.findAll({ attributes: ['PositionId', 'BoxName'] });

			return createResponse(HttpStatus.OK, messages.S44, result);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Export Api Month Report
	async exportMonthReport(date: any, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();

		try {
			const empNames = await this._empBasicInfo.findAll({
				attributes: ['FullName'],
				include: [
					{
						model: this._empMonthReport,
						include: [
							{
								model: this._9Box,
								attributes: ['BoxName']
							}
						],

						attributes: ['BillableHours', 'NonBillableHours', 'Remarks'],
						where: {
							ForMonth: date,
							CreatedBy: claims.EmployeeGuID
						},
						required: true
					}
				],
				raw: true
			});

			if (empNames && empNames.length) {
				await transaction.commit();
				return createResponse(HttpStatus.OK, messages.S45, empNames);
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W32);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
