import { ConflictException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AbstractEmployee } from '../abstract/employee.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { Sequelize } from 'sequelize-typescript';
import { messages } from '@app/shared/messages.shared';
import { MsSqlConstants } from '../connection/constants.mssql';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { TblDesignation } from '../models/master.designation.models';
import { TblDepartment } from '../models/readonly.department.models';
import { Op } from 'sequelize';
import { EmployeesTblRoles } from '../models/employees.roles.models';
import { TblProjectMapping } from '../models/employees.project-mapping.models';
import { TblProjects } from '../models/master.projects.model';
import { MasterRoles } from '../models/master.roles.models';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { TblSkillMapping } from '../models/employees.skill-mapping.models';
import { TblSkillTags } from '../models/readonly.skill-tags.models';
import { TblSkills } from '../models/master.skill.models';
import { AddSkillDto, PatchSkillRatingDto } from '@app/modules/employee/dto/skill.dto';
import AppLogger from '@app/core/logger/app-logger';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { CommonRegExp } from '@app/shared/regex.shared';
import { measureMemory } from 'vm';
import { v4 as uuidv4 } from 'uuid';
import { Tbl_EmailLogsMaster } from '../models/logs.emailLogsMaster.models';

@Injectable()
export class EmployeeDao implements AbstractEmployee {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER)
		private readonly sequalize: Sequelize,
		readonly _loggerSvc: AppLogger,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _basicInfoModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.EMPLOYEES_SKILL_MAPPING_MODEL) private _skillMappingModel: typeof TblSkillMapping,
		@Inject(MsSqlConstants.EMPLOYEES_ROLES_MODEL) private _emproleModel: typeof EmployeesTblRoles,
		@Inject(MsSqlConstants.MASTER_DESIGNATION_MODEL) private _tbldesignation: typeof TblDesignation,
		@Inject(MsSqlConstants.READONLY_DEPARTMENT_MODEL) private _tbldepartment: typeof TblDepartment,
		@Inject(MsSqlConstants.EMPLOYEES_PROJECT_MAPPING_MODEL) private _projectMapping: typeof TblProjectMapping,
		@Inject(MsSqlConstants.MASTER_PROJECTS_MODEL) private _MasterProject: typeof TblProjects,
		@Inject(MsSqlConstants.LOGS_EMAIL_LOGS_MASTER) private _TblEmailLogsMaster: typeof Tbl_EmailLogsMaster
	) {}

	//#region findbyuserName
	async findbyUsername(username: string, id?: string): Promise<any> {
		try {
			const whereClause: any = { Username: username };
			if (id) {
				whereClause.EmployeeGuID = { [Op.ne]: id };
			}
			const employee = await this._basicInfoModel.findOne({ where: whereClause });
			return employee;
		} catch (err) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	//#region findbyEmailAddress
	async findbyEmailAddress(communicationEmailAddress: any, id?: string): Promise<any> {
		try {
			const whereClause: any = { CommunicationEmailAddress: communicationEmailAddress };
			if (id) {
				whereClause.EmployeeGuID = { [Op.ne]: id };
			}
			const employee = await this._basicInfoModel.findOne({ where: whereClause });
			return employee;
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region finduserByEmployeeG7Id
	async finduserByEmployeeG7Id(employeeID: string, id?: string): Promise<any> {
		try {
			const whereClause: any = { EmployeeID: employeeID };
			if (id) {
				whereClause.EmployeeGuID = { [Op.ne]: id };
			}
			const employeeg7id = await this._basicInfoModel.findOne({ where: whereClause });
			return employeeg7id;
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Post Employee
	async postBasicInfo(infoDetails: any, EmpRoleData: any): Promise<AppResponse> {
		const transaction = await this.sequalize.transaction();
		try {
			delete infoDetails.RoleID;
			await this._basicInfoModel.create(infoDetails);
			await this._emproleModel.bulkCreate(EmpRoleData);
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S34);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Get All Employees filter by name,designation,Department
	async getAllUsers(fullName?: string, departmentName?: string, designationName?: string, page = 1, limit = 10, claims?: any): Promise<any> {
		try {
			const parsedPageSize = parseInt(String(limit), 10);
			const currentRole = {
				RoleName: claims.RoleName,
				EmployeeGuid: claims.EmployeeGuID
			};
			// Calculate offset for pagination
			const offset = (page - 1) * parsedPageSize;

			const whereCondition = {};

			if (fullName) {
				whereCondition['FullName'] = {
					FullName: {
						[Op.like]: `%${fullName}%`,
						[Op.or]: {
							[Op.like]: `%${fullName.toLowerCase()}%`,
							[Op.like]: `%${fullName.toUpperCase()}%`
						}
					}
				};
			}

			if (departmentName) {
				whereCondition['DepartmentName'] = {
					DepartmentName: {
						[Op.like]: `%${departmentName}%`
					}
				};
			}

			if (designationName) {
				whereCondition['DesignationName'] = {
					DesignationName: {
						[Op.like]: `%${designationName}%`
					}
				};
			}
			if (currentRole.RoleName === 'Reporting Manager') {
				if (fullName) {
					whereCondition['ReportingManagerEmployeeGuID'] = {
						ReportingManagerEmployeeGuID: {
							[Op.eq]: currentRole.EmployeeGuid
						},
						FullName: whereCondition['FullName'].FullName
					};
				} else {
					whereCondition['ReportingManagerEmployeeGuID'] = {
						ReportingManagerEmployeeGuID: {
							[Op.eq]: currentRole.EmployeeGuid
						}
					};
				}
			}

			const getAllUsersResponse = await this._basicInfoModel.findAll({
				attributes: {
					exclude: ['CreatedBy', 'UpdatedBy', 'UpdatedAt', 'Password']
				},
				where: currentRole.RoleName === 'Reporting Manager' ? whereCondition['ReportingManagerEmployeeGuID'] : whereCondition['FullName'],
				include: [
					{ model: this._basicInfoModel, as: 'reportingManager', attributes: ['FullName'], foreignKey: 'ReportingManagerEmployeeGuID' },
					{
						model: this._tbldepartment,
						as: 'department',
						attributes: ['DepartmentName'],
						where: whereCondition['DepartmentName']
					},
					{ model: this._tbldesignation, attributes: ['DesignationName'], where: whereCondition['DesignationName'] },
					{
						model: this._emproleModel,
						where: {
							EffectiveTill: {
								[Op.gt]: unix_ts_now()
							}
						},
						required: false,
						include: [
							{
								model: MasterRoles
							}
						]
					}
				],
				order: [['CreatedAt', 'DESC']],
				limit: parsedPageSize,
				offset: offset
			});

			const totalUsersCount = await this._basicInfoModel.count({
				where: currentRole.RoleName === 'Admin' ? whereCondition['FullName'] : whereCondition['ReportingManagerEmployeeGuID']
			});

			const flattenedResponse = getAllUsersResponse.map((user) => ({
				EmployeeGuID: user.EmployeeGuID,
				FullName: user.FullName,
				Username: user.Username,
				CommunicationEmailAddress: user.CommunicationEmailAddress,
				EmployeeID: user.EmployeeID,
				JoiningDate: user.JoiningDate,
				TotalYearsOfExperience: user.TotalYearsOfExperience,
				DesignationId: user.DesignationId,
				DepartmentId: user.DepartmentId,
				DesignationName: user.designation.DesignationName,
				DepartmentName: user.department.DepartmentName,
				ReportingManagerFullName: user.reportingManager ? user.reportingManager.FullName : null,
				ReportingManagerEmployeeGuID: user.ReportingManagerEmployeeGuID ? user.ReportingManagerEmployeeGuID : null,
				HourlyCost: user.HourlyCost,
				IsActive: user.IsActive,
				AdditionalRoles: user.empRoleMappings.map((x) => x.MasterRoleId.RoleId).filter((roleId: any) => roleId !== 3)
			}));

			if (currentRole.RoleName === 'Admin' || currentRole.RoleName === 'Reporting Manager') {
				return createResponse(HttpStatus.OK, messages.S29, {
					// totalUsersCount: currentRole.RoleName === 'Admin' ? totalUsersCount : flattenedResponse.length,
					totalUsersCount: totalUsersCount,
					users: flattenedResponse
				});
			}

			return createResponse(HttpStatus.BAD_REQUEST, messages.W20);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Find User By Employee Guid
	async findbyEmpguidbasic(id: string): Promise<any> {
		try {
			const founduser = await this._basicInfoModel.findOne({
				where: { EmployeeGuID: id }
			});
			if (!founduser) {
				return createResponse(HttpStatus.NOT_FOUND, 'user not found');
			}
			return founduser;
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region
	async getUserRolesDao(id): Promise<any> {
		try {
			// const time = Math.floor(+new Date() / 1000)
			const empRoles = await this._emproleModel.update({ EffectiveTill: unix_ts_now(), IsDefault: false }, { where: { EmployeeGuID: id } });
			return createResponse(HttpStatus.OK, 'Successfully updated');
		} catch (err) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Update Basic info
	async updateInfo(id: string, data: any): Promise<any> {
		const transaction = await this.sequalize.transaction();
		try {
			await this._basicInfoModel.update(data, {
				where: { EmployeeGuID: id }
			});
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S40);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Update Roles
	async updateRole(empRoledata: any, isRmRole, id): Promise<any> {
		const transaction = await this.sequalize.transaction();
		try {
			if (!isRmRole) {
				await this._basicInfoModel.update(
					{ ReportingManagerEmployeeGuID: null },
					{
						where: {
							ReportingManagerEmployeeGuID: id
						}
					}
				);
			}
			const updatedEmployeeRole = await this._emproleModel.bulkCreate(empRoledata);
			await transaction.commit();
			return updatedEmployeeRole;
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region statusUpdate
	async statusUpdate(id: string, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this.sequalize.transaction();
		try {
			const employee = await this._basicInfoModel.findByPk(id, { transaction });

			if (!employee) {
				await transaction.rollback();
				return createResponse(HttpStatus.NOT_FOUND, 'Employee not found');
			}
			const newStatus = !employee.IsActive;

			await employee.update({ IsActive: newStatus, UpdatedBy: claims.EmployeeGuID, UpdatedAt: unix_ts_now() }, { transaction });

			await transaction.commit();
			return createResponse(HttpStatus.OK, `Status updated to ${newStatus ? 'active' : 'inactive'}`);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region getEmpProjectsDao
	async getEmpProjectsDao(id: string): Promise<any> {
		try {
			const getEmpwithProjectName = await this._basicInfoModel.findOne({
				where: { EmployeeGuID: id },
				include: [
					{
						model: this._projectMapping,
						include: [
							{
								model: this._MasterProject,
								attributes: ['ProjectName', 'ProjectDescription', 'StartDate', 'EndDate']
							}
						],
						where: { IsActive: true }
					}
				],
				attributes: ['FullName', 'Username']
			});

			const today = new Date().getTime();
			const pastProjects = [];
			const activeProjects = [];
			const upcomingProjects = [];

			getEmpwithProjectName.projectMappings.forEach((project) => {
				const startDate = new Date(project.ProjectGuIdInfo.StartDate).getTime();
				const endDate = new Date(project.ProjectGuIdInfo.EndDate).getTime();

				const projects = {
					ProjectName: project.ProjectGuIdInfo.ProjectName,
					ProjectDescription: project.ProjectGuIdInfo.ProjectDescription,
					StartDate: project.ProjectGuIdInfo.StartDate,
					EndDate: project.ProjectGuIdInfo.EndDate,
					Projectguid: project.ProjectGuIdInfo.ProjectGuId,
					DailyAllocatedHours: project.DailyAllocatedHours
				};
				if (endDate < today) {
					pastProjects.push({
						...projects
					});
				} else if (startDate <= today && endDate >= today) {
					activeProjects.push({
						...projects
					});
				} else if (startDate > today) {
					upcomingProjects.push({
						...projects
					});
				}
			});

			return {
				FullName: getEmpwithProjectName.FullName,
				Username: getEmpwithProjectName.Username,
				activeProjects,
				pastProjects,
				upcomingProjects
			};
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region
	async getEmployeeAllRolesDao(id: any): Promise<any> {
		try {
			const emproles = await this._emproleModel.findAll({
				where: {
					EmployeeGuID: id,
					EffectiveTill: {
						[Op.gt]: unix_ts_now()
					}
				},
				attributes: ['RoleID']
			});
			return createResponse(HttpStatus.OK, 'All Roles Emp fetched successfully', emproles);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region Finding employees skills
	async findEmployeeByIdc(employeeId: string, claims: JwtToken): Promise<AppResponse> {
		try {
			const employees = await this._basicInfoModel.findOne({
				attributes: ['FullName', 'Username'],

				where: { EmployeeGuID: employeeId },

				include: [
					{
						model: TblSkillMapping,
						include: [
							{
								model: TblSkills,
								include: [
									{
										model: TblSkillTags
									}
								],
								where: {
									IsActive: true
								},
								required: true
							}
						],
						where: {
							IsActive: true
						}
					}
				]
			});

			if (!employees) {
				// No employee found with the given EmployeeGuID
				return createResponse(HttpStatus.BAD_REQUEST, 'No skill record');
			}
			// Extract relevant information from the result
			const fullName = employees.FullName;
			const { Username } = employees;

			const skillMappings = employees.skillsMappings;
			let skills = [];
			if (skillMappings && skillMappings.length > 0) {
				skills = skillMappings.map((sm) => {
					return {
						SkillName: sm.SkillGuIdInfo.SkillName,
						SelfRating: sm.SelfRating,
						ReportingManagerRating: sm.ReportingManagerRating,
						SkillTags: sm.SkillGuIdInfo.SkillTagIdInfo.SkillTagName,
						skillMappingsGuid: sm.SkillMappingGuId
					};
				});
			}

			const response = {
				BasicInfo: {
					FullName: fullName,
					Username: Username
				},
				Skills: skills
			};

			return createResponse(HttpStatus.OK, messages.S10, response);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR, claims?.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Deactivating the skill of the employee
	async deleteSkillMapping(SkillMappingGuId: string, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this.sequalize.transaction();
		try {
			const skillmappingExists = await this._skillMappingModel.findOne({
				where: { SkillMappingGuId: SkillMappingGuId }
			});

			if (!skillmappingExists) {
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.BAD_REQUEST, messages.W41);
			}

			const skillMapping = await this._skillMappingModel.findOne({
				where: {
					SkillMappingGuId: SkillMappingGuId,
					IsActive: false // Check if the skill mapping is already deactivated
				}
			});

			if (skillMapping) {
				// Skill mapping is already deactivated
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.BAD_REQUEST, messages.W6);
			}
			const [updatedCount] = await this._skillMappingModel.update(
				{ IsActive: false, UpdatedBy: claims.EmployeeGuID, UpdatedAt: unix_ts_now() },
				{
					where: {
						SkillMappingGuId: SkillMappingGuId,
						IsActive: true // Ensure the skill mapping is currently active
					}
				}
			);

			if (updatedCount > 0) {
				await transaction.commit();
				return createResponse(HttpStatus.OK, messages.S41);
			}
			throw new NotFoundException('Skill mapping not found or could not be deactivated.');
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR, claims?.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Adding some more skills to the employee
	async addSkillToEmployee(employeeGuID: string, addSkillDto: AddSkillDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this.sequalize.transaction();
		try {
			// Check if the employee exists in the basic employee information
			const employeeExists = await this._basicInfoModel.findOne({
				where: { EmployeeGuID: employeeGuID }
			});

			if (!employeeExists) {
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.BAD_REQUEST, messages.W20);
			}
			if (!CommonRegExp.UUID_REGEX.test(employeeGuID)) {
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.BAD_REQUEST, 'Invalid employeeGuID format.');
			}
			const skillExists = await TblSkills.findOne({
				where: { SkillGuId: addSkillDto.SkillGuId }
			});

			if (!skillExists) {
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.BAD_REQUEST, messages.W12);
			}
			const skillMappingactive = await this._skillMappingModel.findOne({
				where: {
					EmployeeGuID: employeeGuID,
					SkillGuId: addSkillDto.SkillGuId,
					IsActive: true
				}
			});
			if (skillMappingactive) {
				await transaction.rollback(); // Rollback the transaction
				return createResponse(HttpStatus.OK, messages.W16);
			}
			let skillMapping = await this._skillMappingModel.findOne({
				where: {
					EmployeeGuID: employeeGuID,
					SkillGuId: addSkillDto.SkillGuId,
					IsActive: false
				}
			});

			if (skillMapping) {
				// Skill mapping already exists for this employee; update it to be active
				skillMapping.IsActive = true;
				skillMapping.UpdatedBy = claims.EmployeeGuID; // Set UpdatedBy
				skillMapping.UpdatedAt = unix_ts_now(); // Set UpdatedAt to the current date
			} else {
				// Skill mapping doesn't exist, create a new one
				skillMapping = new this._skillMappingModel();
				skillMapping.SkillMappingGuId = uuidv4();
				skillMapping.EmployeeGuID = employeeGuID;
				skillMapping.SkillGuId = addSkillDto.SkillGuId;
				skillMapping.SelfRating = 0; // Set to default value
				skillMapping.ReportingManagerRating = 0; // Set to default value
				skillMapping.IsActive = true;
				skillMapping.CreatedBy = claims.EmployeeGuID; // Set CreatedBy
				skillMapping.CreatedAt = unix_ts_now(); // Set CreatedAt to the current date
			}

			await skillMapping.save();
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S42);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR, claims?.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Updating Reporting manager rating
	async patchSkillRating(SkillMappingGuId: string, patchDto: PatchSkillRatingDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this.sequalize.transaction();
		try {
			const skillMapping = await this._skillMappingModel.findOne({
				where: {
					SkillMappingGuId: SkillMappingGuId
				}
			});

			if (!skillMapping) {
				createResponse(HttpStatus.BAD_REQUEST, messages.W41);
			}
			if (!CommonRegExp.UUID_REGEX.test(SkillMappingGuId)) {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Invalid employeeGuID format.');
			}

			if (patchDto.ReportingManagerRating !== undefined) {
				skillMapping.ReportingManagerRating = patchDto.ReportingManagerRating;
				skillMapping.UpdatedBy = claims.EmployeeGuID;
				skillMapping.UpdatedAt = unix_ts_now();
			}

			skillMapping.save();
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S43);
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async addEmailLog(mailobj: any): Promise<any> {
		const transaction = await this.sequalize.transaction();
		try {
			await this._TblEmailLogsMaster.create(mailobj);
			await transaction.commit();
			return createResponse(HttpStatus.OK, 'EmailLog added successfully');
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
}
