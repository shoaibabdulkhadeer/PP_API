import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AbstractMaster } from '../abstract/masters.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { MsSqlConstants } from '../connection/constants.mssql';
import { TblDepartment } from '../models/readonly.department.models';
import { messages } from '@app/shared/messages.shared';
import { TblDesignation } from '../models/master.designation.models';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { EmployeesTblRoles } from '../models/employees.roles.models';
import { MasterRoles } from '../models/master.roles.models';
import { Sequelize, Op } from 'sequelize';
import { TblSkills } from '../models/master.skill.models';
import { TblCertifications } from '../models/masters.certifications.models';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';

@Injectable()
export class MastersDao implements AbstractMaster {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER)
		private readonly sequalize: Sequelize,
		@Inject(MsSqlConstants.READONLY_DEPARTMENT_MODEL) private _TblDepartment: typeof TblDepartment,
		@Inject(MsSqlConstants.MASTER_DESIGNATION_MODEL) private _TblDesignation: typeof TblDesignation,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _basicInfoModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.EMPLOYEES_ROLES_MODEL) private _emproleModel: typeof EmployeesTblRoles,
		@Inject(MsSqlConstants.MASTER_ROLES_MODEL) private _masterRoles: typeof MasterRoles,
		@Inject(MsSqlConstants.MASTER_SKILL_MODEL) private _masterSkills: typeof TblSkills,
		@Inject(MsSqlConstants.MASTER_CERTIFICATIONS_MODEL) private _masterCertificates: typeof TblCertifications
	) {}

	//#region GetdepartmentDao
	async getDepartmentsDao(): Promise<AppResponse> {
		try {
			const departments = await this._TblDepartment.findAll({
				attributes: ['DepartmentId', 'DepartmentName']
			});
			return createResponse(HttpStatus.OK, messages.S30, departments);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region
	async getDesignationDao(): Promise<AppResponse> {
		try {
			const designation = await this._TblDesignation.findAll({
				attributes: ['DesignationId', 'DesignationName']
			});
			return createResponse(HttpStatus.OK, messages.S36, designation);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region
	async getUserRoleRmDao(): Promise<AppResponse> {
		try {
			const getRmResponse = await this._emproleModel.findAll({
				include: [
					{
						model: this._masterRoles,
						where: {
							RoleId: 2
						},
						attributes: []
					},
					{
						model: this._basicInfoModel,
						as: 'EmployeeGuIDInfo',
						attributes: ['EmployeeGuID', 'FullName', 'DepartmentId']
					}
				],
				where: {
					EffectiveTill: {
						[Op.gt]: unix_ts_now()
					}
				},
				attributes: []
			});

			const flattenedResponse = getRmResponse.map((item) => item.EmployeeGuIDInfo);

			return createResponse(HttpStatus.OK, messages.S37, flattenedResponse);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getAdditionalRolesDao
	async getAdditionalRolesDao(): Promise<AppResponse> {
		try {
			const allroles = await this._masterRoles.findAll({
				where: {
					RoleName: {
						[Op.ne]: 'Employee'
					}
				},
				attributes: ['RoleId', 'RoleName']
			});

			return createResponse(HttpStatus.OK, messages.S35, allroles);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get SkillsDao
	async getallskillsDao(): Promise<AppResponse> {
		try {
			const getallskills = await this._masterSkills.findAll({
				attributes: ['SkillGuId', 'SkillName', 'SkillDescription'],
				where: {
					IsActive: true
				}
			});
			return createResponse(HttpStatus.OK, messages.S21, getallskills);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Get Certifications
	async getallCertificatesDao(): Promise<AppResponse> {
		try {
			const certificates = await this._masterCertificates.findAll({
				attributes: ['CertificationGuId', 'CertificationName', 'CertificationDescription'],
				where: {
					IsActive: true
				}
			});
			return createResponse(HttpStatus.OK, messages.S39, certificates);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
		//#endregion
	}
}
