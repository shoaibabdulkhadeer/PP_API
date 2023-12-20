import AppLogger from '@app/core/logger/app-logger';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { CreateCertificationDto } from '@app/modules/ProfileEmployee/dto/createCertification.dto';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AbstractProfileEmployeeDao } from '../abstract/profileEmployee.abstract';
import { MsSqlConstants } from '../connection/constants.mssql';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { TblCertificationMapping } from '../models/employees.certification-mapping.models';
import { TblMonthlyPerformanceInfo } from '../models/employees.monthly-performance-info.models';
import { TblProjectMapping } from '../models/employees.project-mapping.models';
import { TblSkillMapping } from '../models/employees.skill-mapping.models';
import { TblDesignation } from '../models/master.designation.models';
import { TblProjects } from '../models/master.projects.model';
import { TblSkills } from '../models/master.skill.models';
import { TblCertifications } from '../models/masters.certifications.models';
import { TblDepartment } from '../models/readonly.department.models';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { Tbl9BoxPositions } from '../models/readonly.9box-positions.models';
import { projectFetchDto } from '@app/modules/ProfileEmployee/dto/projectFetch.dto';
import { projectStatus } from '@app/core/enums/project-status.enum';

@Injectable()
export class ProfileEmployeeDao implements AbstractProfileEmployeeDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER)
		private readonly _sequalize: Sequelize,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _basicInfoModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.READONLY_DEPARTMENT_MODEL) private _departmentModel: typeof TblDepartment,
		@Inject(MsSqlConstants.MASTER_DESIGNATION_MODEL) private _designationModel: typeof TblDesignation,

		@Inject(MsSqlConstants.EMPLOYEES_PROJECT_MAPPING_MODEL) private _projectsMappingModel: typeof TblProjectMapping,
		@Inject(MsSqlConstants.MASTER_PROJECTS_MODEL) private _projectModel: typeof TblProjects,

		@Inject(MsSqlConstants.EMPLOYEES_SKILL_MAPPING_MODEL) private _skillMappingModel: typeof TblSkillMapping,
		@Inject(MsSqlConstants.MASTER_SKILL_MODEL) private _skillsModel: typeof TblSkills,

		@Inject(MsSqlConstants.EMPLOYEES_CERTIFICATION_MAPPING_MODEL) private _certificationsMappingModel: typeof TblCertificationMapping,
		@Inject(MsSqlConstants.MASTER_CERTIFICATIONS_MODEL) private _certificatesModel: typeof TblCertifications,

		@Inject(MsSqlConstants.EMPLOYEES_MONTHLY_PERFORMANCE_INFO_MODEL) private _monthlyPerformanceModel: typeof TblMonthlyPerformanceInfo,
		@Inject(MsSqlConstants.READONLY_9BOX_POSITIONS_MODEL) private _9boxPosition: typeof Tbl9BoxPositions,

		readonly _loggerSvc: AppLogger
	) {}

	// Check EmployeeGuid Functions
	async checkEmployeeID(id: string): Promise<AppResponse> {
		try {
			const getEmployeeByIdResponse = await this._basicInfoModel.findOne({
				where: {
					EmployeeGuID: id
				}
			});
			if (!getEmployeeByIdResponse) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.S5);
			}
			return createResponse(HttpStatus.OK, messages.S4, getEmployeeByIdResponse.toJSON());
		} catch (error) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	// 1. Get an Employee's Details by EmployeeGuID -- DAO
	//#region 1. Get an Employee's Details by EmployeeGuID -- DAO
	async getEmployeeByID(id: string): Promise<AppResponse> {
		try {
			const getEmployeeByIdResponse = await this._basicInfoModel.findOne({
				attributes: [
					'FullName',
					'Username',
					'CommunicationEmailAddress',
					'EmployeeID',
					'JoiningDate',
					'TotalYearsOfExperience',
					'HourlyCost',
					'IsActive'
				],
				where: {
					EmployeeGuID: id
				},
				include: [
					{
						model: this._basicInfoModel,
						as: 'reportingManager',
						attributes: ['FullName']
					},
					{
						model: this._departmentModel,
						attributes: ['DepartmentName']
					},
					{
						model: this._designationModel,
						attributes: ['DesignationName']
					}
				]
			});
			if (!getEmployeeByIdResponse) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.S5);
			}
			return createResponse(HttpStatus.OK, messages.S6, getEmployeeByIdResponse);
		} catch (errorWhileFetchingProfile) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 2. Get all projects for an Employee by EmployeeGuID -- DAO
	//#region 2. Get all projects for an Employee by EmployeeGuID -- DAO
	async getEmployeeProjectsById(id: string, projectFetchBody: projectFetchDto, projectName: string, parameterPageId = 1): Promise<AppResponse> {
		try {
			const pageLimit = 5;

			let pageId: number;
			if (!parameterPageId) {
				pageId = 1;
			} else {
				pageId = parameterPageId;
			}

			const pagesToSkip = (pageId - 1) * pageLimit;
			const whereCondition = {};

			const currentDate = new Date();

			// If projectStatus is ACTIVE, filter only Active Projects from "[Masters].[Tbl_Projects]" Model
			if (projectFetchBody.projectStatus === projectStatus.ACTIVE) {
				whereCondition['StartDate'] = {
					[Op.lte]: currentDate
				};
				whereCondition['EndDate'] = {
					[Op.gte]: currentDate
				};
			}

			// If projectStatus is PAST, filter only Past Projects from "[Masters].[Tbl_Projects]" Model
			if (projectFetchBody.projectStatus === projectStatus.PAST) {
				whereCondition['StartDate'] = {
					[Op.lt]: currentDate
				};
				whereCondition['EndDate'] = {
					[Op.lte]: currentDate
				};
			}

			// If projectStatus is UPCOMING, filter only future projects from "[Masters].[Tbl_Projects]" Model
			if (projectFetchBody.projectStatus === projectStatus.UPCOMING) {
				whereCondition['StartDate'] = {
					[Op.gt]: currentDate
				};
				whereCondition['EndDate'] = {
					[Op.gte]: currentDate
				};
			}
			// 1. Get all Total projects based on projectStatus
			const totalProjectsCount = await this._projectsMappingModel.count({
				include: [
					{
						model: this._projectModel,
						where: whereCondition
					}
				],
				where: {
					IsActive: true,
					EmployeeGuID: id
				}
			});

			// If project Name is given in query, apply projectName whereConditions while including "[Masters].[Tbl_Projects]" Model
			if (projectName) {
				whereCondition['ProjectName'] = {
					[Op.like]: `%${projectName}%`,
					[Op.or]: {
						[Op.like]: `%${projectName.toLowerCase()}%`,
						[Op.like]: `%${projectName.toUpperCase()}%`
					}
				};
			}

			// 2. Search all project based on ProjectStatus and pageId
			const getProjectsByIdResponse = await this._projectsMappingModel.findAll({
				attributes: ['DailyAllocatedHours', 'ProjectGuId'],
				include: [
					{
						model: this._projectModel,
						attributes: ['ProjectName', 'ProjectDescription', 'IsActive', 'StartDate', 'EndDate'],
						where: whereCondition
					}
				],
				where: {
					IsActive: true,
					EmployeeGuID: id
				},
				limit: pageLimit,
				offset: pagesToSkip
			});

			if (getProjectsByIdResponse === null) {
				const projectData = [];
				return createResponse(HttpStatus.OK, messages.S7, projectData);
			}
			// Convert all Project Mappings Data to JSON
			const employeeAllProjects = getProjectsByIdResponse.map((project) => project.toJSON());

			const finalProjectData = await Promise.all(
				employeeAllProjects.map(async (project) => {
					const projectID = project.ProjectGuId;
					const employeeOnProject = await this._projectsMappingModel.findAll({
						where: {
							ProjectGuId: projectID
						},
						include: [
							{
								model: this._basicInfoModel,
								as: 'EmployeeGuIDInfo',
								attributes: ['FullName']
							}
						]
					});
					project.ProjectGuIdInfo['Team_Count'] = employeeOnProject.length;
					project.ProjectGuIdInfo['Team_Members'] = [];
					employeeOnProject.forEach((membersData) => {
						project.ProjectGuIdInfo['Team_Members'].push(membersData.EmployeeGuIDInfo.FullName);
					});
					const { ProjectGuIdInfo, ...restProjectData } = project;
					return { ...restProjectData, ...ProjectGuIdInfo };
				})
			);
			return createResponse(HttpStatus.OK, messages.S8, { projectsCount: totalProjectsCount, Projects: finalProjectData });
		} catch (errorWhileFetchingProjects) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 3. Get an Employee Skills by EmployeeGuID -- DAO
	//#region 3. Get an Employee Skills by EmployeeGuID -- DAO
	async getSkillsByEmployeeId(id: string): Promise<AppResponse> {
		try {
			const getSkillsByIdResponse = await this._basicInfoModel.findAll({
				attributes: ['EmployeeGuID', 'FullName'],
				include: [
					{
						model: this._skillMappingModel,
						attributes: {
							exclude: ['CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt']
						},
						where: {
							IsActive: 1
						},
						include: [
							{
								model: this._skillsModel,
								attributes: {
									exclude: ['CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt']
								}
							}
						]
					}
				],
				where: {
					EmployeeGuID: id
				}
			});
			if (getSkillsByIdResponse.length === 0) {
				return createResponse(HttpStatus.OK, messages.S9, getSkillsByIdResponse);
			}
			return createResponse(HttpStatus.OK, messages.S10, getSkillsByIdResponse);
		} catch (errorWhileFetchingSkills) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 4. Patch an Employee's Skill self rating -- DAO
	//#endregion 4. Patch an Employee's Skill self rating -- DAO
	async patchSkillsByEmployeeId(patchBody: { SelfRating: number; SkillGuId: string }, claims: JwtToken): Promise<AppResponse> {
		if (!patchBody.SkillGuId || !patchBody.SelfRating) {
			return createResponse(HttpStatus.BAD_REQUEST, messages.W25);
		}
		const transaction = await this._sequalize.transaction();
		try {
			const patchSkillsByIdResponse = await this._skillMappingModel.update(
				{ SelfRating: patchBody.SelfRating, UpdatedBy: claims.EmployeeGuID, UpdatedAt: unix_ts_now() },
				{
					where: {
						EmployeeGuID: claims.EmployeeGuID,
						SkillGuId: patchBody.SkillGuId
					},
					transaction: transaction
				}
			);
			if (patchSkillsByIdResponse[0] === 0) {
				return createResponse(HttpStatus.OK, messages.S9);
			}
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S11);
		} catch (errorWhilePatchingSkills) {
			if (transaction) {
				await transaction.rollback();
			}
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 5. Get All Certifiates by EmployeeGuID -- DAO
	//#region 5. Get All Certifiates by EmployeeGuID -- DAO
	async getAllCertificatesFromMaster(): Promise<AppResponse> {
		try {
			const getAllCertificatesResponse = await this._certificatesModel.findAll({
				attributes: ['CertificationGuId', 'CertificationName']
			});
			if (getAllCertificatesResponse.length === 0) {
				return createResponse(HttpStatus.OK, messages.S38, getAllCertificatesResponse);
			}
			const allCertifications = getAllCertificatesResponse.map((certificate) => certificate.toJSON());
			return createResponse(HttpStatus.OK, messages.S39, allCertifications);
		} catch (errorWhileFetchingCertificates) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 6. Get an Employee Certifiates by EmployeeGuID -- DAO
	//#region 6. Get an Employee Certifiates by EmployeeGuID -- DAO
	async getCertificatesById(id: string): Promise<AppResponse> {
		try {
			const getCertificatesByIdResponse = await this._certificationsMappingModel.findAll({
				where: {
					EmployeeGuID: id
				},
				attributes: ['CertificationMappingGuId', 'EmployeeGuID', 'CertificationGuId', 'CertificationFileNameWithExtension', 'CreatedAt'],
				include: [
					{
						model: this._certificatesModel,
						attributes: ['CertificationGuId', 'CertificationName', 'CertificationDescription', 'IsActive']
					}
				]
			});
			if (getCertificatesByIdResponse.length === 0) {
				return createResponse(HttpStatus.OK, messages.S12, getCertificatesByIdResponse);
			}
			return createResponse(HttpStatus.OK, messages.S13, getCertificatesByIdResponse);
		} catch (errorWhileFetchingCertificateById) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 7. Post an Employee Certifiation by EmployeeGuID -- DAO
	//#endregion 7. Post an Employee Certifiation by EmployeeGuID -- DAO
	async postCertificateById(body: CreateCertificationDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequalize.transaction();
		try {
			const downloadedCertificates = await this.downloadCertificateById(body);
			if (downloadedCertificates.data) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W40);
			}
			const postCertificatesByIdResponse = await this._certificationsMappingModel.create(
				{
					CertificationMappingGuId: uuidv4(),
					CertificationGuId: body.CertificationGuId,
					EmployeeGuID: body.EmployeeGuID,
					CreatedBy: claims.EmployeeGuID,
					CertificationFileNameWithExtension: `${body.CertificationGuId}.pdf`,
					CreatedAt: unix_ts_now()
				},
				{ transaction: transaction }
			);
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S14);
		} catch (errorWhilePostingCertificate) {
			if (transaction) {
				await transaction.rollback();
			}
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	// 8. Download an Employee Certifiation by EmployeeGuID and CertificationGuId  -- DAO
	//#region 8.Post an Employee Certifiation by EmployeeGuID -- DAO
	async downloadCertificateById(body: CreateCertificationDto): Promise<AppResponse> {
		try {
			const downloadCertificatesByIdResponse = await this._certificationsMappingModel.findOne({
				where: {
					CertificationGuId: body.CertificationGuId,
					EmployeeGuID: body.EmployeeGuID
				}
			});
			return createResponse(HttpStatus.OK, messages.S13, downloadCertificatesByIdResponse);
		} catch (errorWhileDownloadingCertificate) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 9. Get an Employee Monthly Performance Report by EmployeeGuID -- DAO
	//#region 9. Get an Employee Monthly Performance Report by EmployeeGuID -- DAO
	async getMonthlyPerformanceById(id: string): Promise<AppResponse> {
		try {
			const getMonthlyPerformanceResponse = await this._monthlyPerformanceModel.findAll({
				attributes: ['ForMonth', 'BillableHours', 'NonBillableHours', 'Remarks'],
				include: [
					{
						model: this._9boxPosition,
						attributes: ['BoxName']
					}
				],
				where: {
					EmployeeGuID: id
				}
			});
			if (getMonthlyPerformanceResponse && getMonthlyPerformanceResponse.length === 0) {
				return createResponse(HttpStatus.OK, messages.S15, getMonthlyPerformanceResponse);
			}
			return createResponse(HttpStatus.OK, messages.S16, getMonthlyPerformanceResponse);
		} catch (errorWhileGeneratingReport) {
			this._loggerSvc.error(messages.E2, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
