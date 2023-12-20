import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { AbstractProjectsSqlDao } from '../abstract/projects.abstract';
import { HttpStatus, Inject } from '@nestjs/common';
import { MsSqlConstants } from '../connection/constants.mssql';
import { Op, Sequelize } from 'sequelize';
import AppLogger from '@app/core/logger/app-logger';
import { messages } from '@app/shared/messages.shared';
import { TblProjects } from '../models/master.projects.model';
import { ProjectsDto, UpdateProjectsDto } from '@app/modules/projects/dto/projects.dto';
import { TblProjectMapping } from '../models/employees.project-mapping.models';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { v4 as uuidv4 } from 'uuid';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';

export class ProjectsDao implements AbstractProjectsSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		@Inject(MsSqlConstants.MASTER_PROJECTS_MODEL) private _projectsModel: typeof TblProjects,
		@Inject(MsSqlConstants.EMPLOYEES_PROJECT_MAPPING_MODEL) private _projectMappingModel: typeof TblProjectMapping,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _basicInfoModel: typeof TblBasicInfo,
		readonly _loggerSvc: AppLogger
	) {}

	//#region get all projects
	async getAllProjects(page: number, limit: number, claims: JwtToken): Promise<AppResponse> {
		try {
			const parsedPageSize = parseInt(String(limit), 10);
			const offset = (page - 1) * parsedPageSize;

			const projectsWithEmployees = await this._projectsModel.findAll({
				offset,
				limit: parsedPageSize,
				include: [
					{
						model: this._projectMappingModel,
						required: false,
						where: { IsActive: 1 },
						include: [
							{
								model: this._basicInfoModel,
								as: 'EmployeeGuIDInfo',
								attributes: ['FullName']
							}
						]
					},
					{
						model: this._basicInfoModel,
						as: 'createdByInfo',
						attributes: ['FullName']
					}
				],
				order: [['CreatedAt', 'DESC']]
			});
			const formattedProjects = projectsWithEmployees.map((project) => {
				const employees = project.TblProjectMappings.map((mapping) => ({
					FullName: mapping.EmployeeGuIDInfo.FullName,
					DailyAllocatedHours: mapping.DailyAllocatedHours
				}));

				return {
					ProjectGuId: project.ProjectGuId,
					ProjectName: project.ProjectName,
					ProjectDescription: project.ProjectDescription,
					StartDate: project.StartDate,
					EndDate: project.EndDate,
					Employees: employees,
					CreatedBy: project.createdByInfo.FullName,
					CreatedAt: project.CreatedAt
				};
			});
			const totalCount = await this._projectsModel.count();
			return createResponse(HttpStatus.OK, messages.S17, {
				projectsCount: totalCount,
				projects: formattedProjects
			});
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region adding Project
	async addProject(projectBody: ProjectsDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			let projectData;
			const addedUsernames = new Set<string>();
			for (let i = 0; i < projectBody.EmployeeData?.length; i++) {
				//To find whether the employee has already added or not
				if (addedUsernames.has(projectBody.EmployeeData[i].FullName)) {
					await transaction.rollback();
					return createResponse(HttpStatus.BAD_REQUEST, `${projectBody.EmployeeData[i].FullName} ${messages.W36}`);
				}
				addedUsernames.add(projectBody.EmployeeData[i].FullName);
			}
			// Insert data into [Masters].[Tbl_Projects]
			const project = await this._projectsModel.findOne({ where: { ProjectName: projectBody.ProjectName }, transaction });
			if (!project) {
				projectData = await this._projectsModel.create(
					{
						ProjectGuId: uuidv4(),
						ProjectName: projectBody.ProjectName,
						ProjectDescription: projectBody.ProjectDescription,
						IsActive: true,
						StartDate: projectBody.StartDate.toISOString(),
						EndDate: projectBody.EndDate.toISOString(),
						CreatedBy: claims.EmployeeGuID,
						CreatedAt: unix_ts_now()
					},
					{ transaction }
				);
			} else {
				await transaction.rollback();
				return createResponse(HttpStatus.BAD_REQUEST, messages.W14);
			}
			if (projectBody.EmployeeData) {
				// Insert data into [Employees].[Tbl_ProjectMapping]
				for (const employeeData of projectBody.EmployeeData) {
					const employeeInfo = await this.getEmployeeInfoByUsername(employeeData.FullName);

					if (!employeeInfo) {
						await transaction.rollback();
						return createResponse(HttpStatus.BAD_REQUEST, `${messages.W8}: ${employeeData.FullName}`);
					}

					await this._projectMappingModel.create(
						{
							EmployeesProjectMappingGuId: uuidv4(),
							EmployeeGuID: employeeInfo.EmployeeGuID,
							ProjectGuId: projectData.ProjectGuId,
							DailyAllocatedHours: employeeData.DailyAllocatedHours,
							CreatedBy: claims.EmployeeGuID,
							CreatedAt: unix_ts_now()
						},
						{ transaction }
					);
				}
			}
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S18);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region update project
	async updateProject(projectId: string, updatedProjectData: UpdateProjectsDto, claims: JwtToken): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const existingProject = await this._projectsModel.findByPk(projectId, { transaction });

			if (!existingProject) {
				await transaction.rollback();
				return createResponse(HttpStatus.BAD_REQUEST, `${messages.W9}: ${projectId}`);
			}
			if (updatedProjectData.ProjectName) {
				const existingProjectName = await this._projectsModel.findOne({ where: { ProjectName: updatedProjectData.ProjectName } });

				if (existingProjectName && existingProjectName.ProjectGuId !== projectId) {
					await transaction.rollback();
					return createResponse(HttpStatus.BAD_REQUEST, messages.W14);
				}
				existingProject.ProjectName = updatedProjectData.ProjectName;
			}

			if (updatedProjectData.ProjectDescription) {
				existingProject.ProjectDescription = updatedProjectData.ProjectDescription;
			}

			if (updatedProjectData.StartDate) {
				existingProject.StartDate = updatedProjectData.StartDate.toISOString();
			}

			if (updatedProjectData.EndDate) {
				existingProject.EndDate = updatedProjectData.EndDate.toISOString();
			}

			let employeeInfo: any;

			//making IsActive as 0
			if (Array.isArray(updatedProjectData.EmployeeData)) {
				const updatedEmployeeUsernames = updatedProjectData.EmployeeData.map((employeeData) => employeeData.FullName);

				const currentProjectMappings = await this._projectMappingModel.findAll({
					where: {
						ProjectGuId: existingProject.ProjectGuId
					},
					transaction
				});

				// Iterate through the current project mappings
				for (const projectMapping of currentProjectMappings) {
					// If the employee is not in the updated list, set isActive to 0
					if (!updatedEmployeeUsernames.includes(projectMapping.EmployeeGuID)) {
						projectMapping.IsActive = false;
						await projectMapping.save({ transaction });
					}
				}

				for (const employeeData of updatedProjectData.EmployeeData) {
					employeeInfo = await this.getEmployeeInfoByUsername(employeeData.FullName);

					if (!employeeInfo) {
						await transaction.rollback();
						return createResponse(HttpStatus.BAD_REQUEST, `${employeeData.FullName} ${messages.W8}`);
					}

					// Check if the employee is already mapped to the project, and update their data
					const projectMapping = await this._projectMappingModel.findOne({
						where: {
							EmployeeGuID: employeeInfo.EmployeeGuID,
							ProjectGuId: existingProject.ProjectGuId
						},
						transaction
					});

					if (projectMapping) {
						projectMapping.DailyAllocatedHours = employeeData.DailyAllocatedHours;
						projectMapping.IsActive = true;
						projectMapping.UpdatedBy = claims.EmployeeGuID;
						projectMapping.UpdatedAt = unix_ts_now();
						await projectMapping.save({ transaction });
					} else {
						// If the employee is not already mapped, create a new mapping entry
						await this._projectMappingModel.create(
							{
								EmployeesProjectMappingGuId: uuidv4(),
								EmployeeGuID: employeeInfo.EmployeeGuID,
								ProjectGuId: existingProject.ProjectGuId,
								DailyAllocatedHours: employeeData.DailyAllocatedHours,
								CreatedBy: claims.EmployeeGuID,
								CreatedAt: unix_ts_now(),
								UpdatedBy: claims.EmployeeGuID,
								UpdatedAt: unix_ts_now()
							},
							{ transaction }
						);
					}
				}
			}
			existingProject.UpdatedBy = claims.EmployeeGuID;
			existingProject.UpdatedAt = unix_ts_now();
			await existingProject.save({ transaction });
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S19);
		} catch (error) {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region get all employees
	async getAllEmployees(claims: JwtToken): Promise<AppResponse> {
		try {
			const projects = await this._basicInfoModel.findAll({});
			const res = projects.map((project: any) => {
				return {
					EmployeeGuID: project.EmployeeGuID,
					FullName: project.FullName
				};
			});
			return createResponse(HttpStatus.OK, messages.S17, res);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
	//#endregion

	//#region  getEmployeeInfoByUsername
	private async getEmployeeInfoByUsername(username: string) {
		try {
			return await this._basicInfoModel.findOne({
				where: {
					FullName: username
				}
			});
		} catch (error) {
			return null;
		}
	}
	//#endregion
}
