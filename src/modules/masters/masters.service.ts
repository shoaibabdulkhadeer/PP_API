import { Injectable, HttpStatus } from '@nestjs/common';
import { AbstractMasterSvc } from './master.abstract';
import { AbstractEmployee } from '@app/database/mssql/abstract/employee.abstract';
import { AppConfigService } from '@app/config/appconfig.service';
import { DatabaseService } from '@app/database/database.service';
import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { AbstractMaster } from '@app/database/mssql/abstract/masters.abstract';
import { messages } from '@app/shared/messages.shared';
// import httpStatus from 'http-status';

@Injectable()
export class MastersService implements AbstractMasterSvc {
	private readonly _MastersTxn: AbstractMaster;

	constructor(
		private readonly _appConfigSvc: AppConfigService,
		_dbSvc: DatabaseService,
		readonly _loggerSvc: AppLogger
	) {
		this._MastersTxn = _dbSvc.mastersTxn;
	}

	//#region getDepartmentSvc
	async getDepartmentSvc(): Promise<AppResponse> {
		try {
			const data = await this._MastersTxn.getDepartmentsDao();
			return data;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getDesignationSvc
	async getDesignationSvc(): Promise<AppResponse> {
		try {
			const data = await this._MastersTxn.getDesignationDao();
			return data;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getUsersRoleRmSvc
	async getUsersRoleRmSvc(): Promise<AppResponse> {
		try {
			const roleRm = await this._MastersTxn.getUserRoleRmDao();
			return roleRm;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  getAdditonalRolesSvc
	async getAdditonalRolesSvc(): Promise<AppResponse> {
		try {
			const getroles = await this._MastersTxn.getAdditionalRolesDao();
			return getroles;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  getAllskillsSvc
	async getAllSkillsSvc(): Promise<AppResponse> {
		try {
			const getallskills = await this._MastersTxn.getallskillsDao();
			return getallskills;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getAllCertificatesSvc
	async getAllCertificatesSvc(): Promise<AppResponse> {
		try {
			const getcertificates = await this._MastersTxn.getallCertificatesDao();
			return getcertificates;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion
}
