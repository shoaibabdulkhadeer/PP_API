import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Sequelize, Op } from 'sequelize';
import { AbstractAuthSqlDao } from '../abstract/auth.abstract';
import { MsSqlConstants } from '../connection/constants.mssql';
import { MasterRoles } from '../models/master.roles.models';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { TblAppSessions } from '../models/logs.app-sessions.models';
import { EmployeesTblRoles } from '../models/employees.roles.models';
import { messages } from '@app/shared/messages.shared';
import { AppSessionModel } from '@app/modules/auth/models/log.app_session.model';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';

@Injectable()
export class AuthSqlDao implements AbstractAuthSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		@Inject(MsSqlConstants.MASTER_ROLES_MODEL) private _masterRolesModel: typeof MasterRoles,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _employeeModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.LOGS_APP_SESSIONS_MODEL) private _appSessionModel: typeof TblAppSessions,
		@Inject(MsSqlConstants.EMPLOYEES_ROLES_MODEL) private _employeesRolesModel: typeof EmployeesTblRoles,
		readonly _loggerSvc: AppLogger
	) {}
	updateEnd(claims: any, roleid: any): Promise<AppResponse> {
		throw new Error('Method not implemented.');
	}

	//#region Create log Session
	async createLogSession(session: AppSessionModel): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			await this._appSessionModel.create(session);
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S4);
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async getUserByCom(email: any): Promise<AppResponse> {
		try {
			const data = await this._employeeModel.findOne({
				attributes: ['Username'],
				where: { CommunicationEmailAddress: email }
			});

			return createResponse(HttpStatus.OK, messages.S4, data.Username);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region Get Employee Details
	async getEmpByUname(Username: string, currentTimeStamp: number): Promise<AppResponse> {
		try {
			const data = await this._employeeModel.findOne({
				attributes: ['EmployeeGuID', 'FullName', 'Username', 'Password', 'DepartmentId'],
				where: { Username, IsActive: 1 },
				include: [
					{
						model: this._employeesRolesModel,
						attributes: ['RoleID', 'IsDefault'],
						where: {
							EffectiveFrom: { [Op.lte]: currentTimeStamp },
							EffectiveTill: { [Op.gte]: currentTimeStamp }
						},
						include: [
							{
								model: this._masterRolesModel,
								attributes: ['RoleName']
							}
						]
					}
				]
			});
			if (!data) {
				return createResponse(HttpStatus.UNAUTHORIZED, messages.W1);
			}
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async getEmpRolesDao(claims: any): Promise<any> {
		try {
			const employeeGuID = claims.EmployeeGuID;
			const data = await this._employeeModel.findOne({
				attributes: [],
				where: { EmployeeGuID: employeeGuID },
				include: [
					{
						model: this._employeesRolesModel,
						attributes: ['RoleID', 'IsDefault'],
						where: {
							EffectiveTill: { [Op.gte]: unix_ts_now() }
						},
						include: [
							{
								model: this._masterRolesModel,
								attributes: ['RoleName']
							}
						]
					}
				]
			});

			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region end Log session
	async logoutSession(claims: JwtToken, EndsAt: number): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			await this._appSessionModel.update(
				{ EndsAt, UpdatedBy: claims.EmployeeGuID, UpdatedAt: unix_ts_now() },
				{ where: { AppSessionGuID: claims.appSessionId } }
			);
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S4);
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Post switchRoles
	async switchRolesDao(claims: any, appSession: any): Promise<AppResponse> {
		try {
			const { appSessionId } = claims;

			await this._appSessionModel.update(
				{
					EndsAt: unix_ts_now(),
					UpdatedBy: claims.EmployeeGuID,
					UpdatedAt: unix_ts_now()
				},
				{
					where: {
						AppSessionGuID: appSessionId
					}
				}
			);

			await this.createLogSession(appSession);

			return createResponse(HttpStatus.OK, messages.S51);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region isDefaultUpdateDao
	async isDefaultUpdateDao(claims: any, roleId: any): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const employeeGuid = claims.EmployeeGuID;

			await this._employeesRolesModel.update(
				{ IsDefault: false },
				{
					where: {
						EmployeeGuID: employeeGuid
					},
					transaction
				}
			);

			// Set IsDefault to true for the specified roleId
			await this._employeesRolesModel.update(
				{ IsDefault: true },
				{
					where: {
						EmployeeGuID: employeeGuid,
						RoleID: roleId
					},
					transaction
				}
			);

			const newDefaultRole = await this.getEmpRolesDao(claims);

			await transaction.commit();

			return createResponse(HttpStatus.OK, messages.S52, newDefaultRole);
		} catch {
			await transaction.rollback();

			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
