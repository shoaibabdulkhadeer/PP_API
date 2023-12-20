import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { MsSqlConstants } from '../connection/constants.mssql';
import { AbstractDashBoardSqlDao } from '../abstract/dashboard.abstract';
import { TblBasicInfo } from '../models/employees.basic-info.models';
import { TblProjectMapping } from '../models/employees.project-mapping.models';
import { TblSkills } from '../models/master.skill.models';
import { TblCertifications } from '../models/masters.certifications.models';
import { TblCertificationMapping } from '../models/employees.certification-mapping.models';
import { TblSkillMapping } from '../models/employees.skill-mapping.models';
import { TblDepartment } from '../models/readonly.department.models';
import { TblProjects } from '../models/master.projects.model';
import { TblDesignation } from '../models/master.designation.models';
import { TblSkillTags } from '../models/readonly.skill-tags.models';
import { Tbl9BoxPositions } from '../models/readonly.9box-positions.models';
import { TblMonthlyPerformanceInfo } from '../models/employees.monthly-performance-info.models';
import { JwtToken } from '@app/modules/auth/models/jwt_token.model';

@Injectable()
export class DashBoardSqlDao implements AbstractDashBoardSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private _tblBasicInfoModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.EMPLOYEES_SKILL_MAPPING_MODEL) private _skillMappingModel: typeof TblSkillMapping,
		@Inject(MsSqlConstants.READONLY_9BOX_POSITIONS_MODEL) private _9b0xModel: typeof Tbl9BoxPositions,
		@Inject(MsSqlConstants.EMPLOYEES_MONTHLY_PERFORMANCE_INFO_MODEL) private _monthlyInfoModel: typeof TblMonthlyPerformanceInfo,
		@Inject(MsSqlConstants.READONLY_DEPARTMENT_MODEL) private _departmentModel: typeof TblDepartment,
		@Inject(MsSqlConstants.EMPLOYEES_PROJECT_MAPPING_MODEL)
		private _tblProjectMappingModel: typeof TblProjectMapping,
		readonly _loggerSvc: AppLogger
	) {}
	//#region logic to get three month billable and non billable employee
	async getThreeMonthProductivity(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const today = new Date();
			const startDate = new Date(today);
			startDate.setMonth(today.getMonth() - 3);

			const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
			const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

			const result = await this._tblBasicInfoModel.findAll({
				include: [
					{
						model: this._monthlyInfoModel,
						attributes: ['BillableHours', 'NonBillableHours'],
						where: {
							ForMonth: {
								[Op.gte]: startOfMonth,
								[Op.lt]: endOfMonth
							}
						}
					}
				],
				where: {
					DepartmentId: DepartmentId
				}
			});
			let totalBillableHours = 0;
			let totalNonBillableHours = 0;

			for (const employee of result) {
				for (const monthlyMapping of employee.monthlyperMappings) {
					totalBillableHours += monthlyMapping.BillableHours;
					totalNonBillableHours += monthlyMapping.NonBillableHours;
				}
			}

			const totalHours = {
				totalBillableHours,
				totalNonBillableHours
			};

			return createResponse(HttpStatus.OK, messages.S50, totalHours);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
	//#region Getting On bench employees
	async getEmployeesWithoutProjects(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const employees = await this._tblBasicInfoModel.findAll({
				attributes: ['FullName', 'ReportingManagerEmployeeGuID', 'HourlyCost', 'EmployeeGuID'],
				where: {
					DepartmentId: DepartmentId // Filter employees by DepartmentId
				},
				include: [
					{
						model: TblProjectMapping,
						required: false,
						include: [
							{
								model: TblProjects,
								required: false
							}
						],
						where: {
							IsActive: true
						}
					},
					{
						model: TblDesignation,
						required: true
					}
				],
				order: [['CreatedAt', 'DESC']]
			});

			const onBenchEmployees = employees.filter((employee) => {
				const projectMappings = employee.projectMappings || [];

				if (projectMappings.length === 0) {
					return true; // No project mappings, so consider on bench
				}

				// Check if there is no active project mapping
				const hasActiveMapping = projectMappings.some((projectMapping) => {
					const project = projectMapping.ProjectGuIdInfo || {};

					return (
						projectMapping.EmployeesProjectMappingGuId && new Date() < new Date(project['EndDate']) && new Date(project['StartDate']) < new Date()
					);
				});

				// If there is no active project mapping, consider the employee on the bench
				return !hasActiveMapping;
			});

			// // Extract relevant information from the result
			const result = onBenchEmployees.map(async (employee) => {
				const fullName = employee.FullName;
				const { EmployeeGuID } = employee;
				const reportingManagerEmployeeGuID = employee.ReportingManagerEmployeeGuID;
				const hourlycost = employee.HourlyCost;

				// Fetch reporting manager's full name based on ReportingManagerEmployeeGuID
				const reportingManager = await this._tblBasicInfoModel.findOne({
					attributes: ['FullName'],
					where: {
						EmployeeGuID: reportingManagerEmployeeGuID
					}
				});

				let reportingManagerName = null;
				if (reportingManager) {
					reportingManagerName = reportingManager.FullName;
				}

				const designationName = employee.designation ? employee.designation.DesignationName : null;

				return {
					FullName: fullName,
					EmployeeGuID: EmployeeGuID,
					Designation: designationName,
					ReportingManagerName: reportingManagerName,
					HourlyCost: hourlycost
				};
			});

			const finalResult = await Promise.all(result);

			return finalResult;
		} catch {
			this._loggerSvc.error(HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Getting employees whose Allocated hours is less than equal to 8
	async getEmployeesWithAllocatedHoursLessThan8(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const employees = await this._tblBasicInfoModel.findAll({
				attributes: ['FullName', 'ReportingManagerEmployeeGuID', 'HourlyCost', 'EmployeeGuID'], // Include ReportingManagerEmployeeGuID
				where: {
					DepartmentId: DepartmentId
				},
				include: [
					{
						model: TblProjectMapping,
						where: {
							[Op.and]: [
								{
									DailyAllocatedHours: {
										[Op.gt]: 0 // Filter employees with DailyAllocatedHours greater than 0
									}
								}
							]
						},
						include: [
							{
								model: TblProjects,
								where: {
									StartDate: { [Op.lte]: new Date() },
									EndDate: { [Op.gte]: new Date() },
									IsActive: 1
								},
								required: true // INNER JOIN to ensure only active projects are considered
							}
						],
						required: true
					},
					{
						model: TblDesignation,
						required: true
					}
				],
				order: [['CreatedAt', 'DESC']]
			});

			// Extract relevant information from the result
			const result = employees.map(async (employee) => {
				const fullName = employee.FullName;
				const { EmployeeGuID } = employee;
				const reportingManagerEmployeeGuID = employee.ReportingManagerEmployeeGuID;
				const hourlycost = employee.HourlyCost;

				// Fetch reporting manager's full name based on ReportingManagerEmployeeGuID
				const reportingManager = await this._tblBasicInfoModel.findOne({
					attributes: ['FullName'],
					where: {
						EmployeeGuID: reportingManagerEmployeeGuID
					}
				});

				let reportingManagerName = null;
				if (reportingManager) {
					reportingManagerName = reportingManager.FullName;
				}

				const designationName = employee.designation ? employee.designation.DesignationName : null;
				const { projectMappings } = employee;
				let totalAllocatedHours = 0; // Initialize total allocated hours

				if (projectMappings && projectMappings.length > 0) {
					const activeProjects = projectMappings.filter((projectMapping) => {
						const project = projectMapping.ProjectGuIdInfo || {};
						return projectMapping.EmployeesProjectMappingGuId && projectMapping.IsActive && new Date() < new Date(project['EndDate']);
					});

					// Calculate the total allocated hours across all active projects
					totalAllocatedHours = activeProjects.reduce((total, projectMapping) => {
						return total + projectMapping.DailyAllocatedHours;
					}, 0);
				}

				return {
					FullName: fullName,
					EmployeeGuID: EmployeeGuID,
					Designation: designationName,
					ReportingManagerName: reportingManagerName,
					HourlyCost: hourlycost,
					TotalAllocatedHours: totalAllocatedHours
				};
			});

			const finalResult = await Promise.all(result);

			// Filter employees based on their total allocated hours being less than 8
			const filteredEmployees = finalResult.filter((employee) => {
				return employee.TotalAllocatedHours > 0 && employee.TotalAllocatedHours < 8;
			});

			// Return the filtered employees without TotalAllocatedHours
			return filteredEmployees.map((employee) => {
				const { FullName, EmployeeGuID, Designation, ReportingManagerName, HourlyCost, TotalAllocatedHours } = employee;
				return {
					FullName,
					EmployeeGuID,
					Designation,
					ReportingManagerName,
					HourlyCost,
					TotalAllocatedHours
				};
			});
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR, claims?.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Getting employees whose Allocated hours is greater than equal to 8
	async getEmployeesWithAllocatedHoursgreaterThan8(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const employees = await this._tblBasicInfoModel.findAll({
				attributes: ['FullName', 'ReportingManagerEmployeeGuID', 'HourlyCost', 'EmployeeGuID'], // Include ReportingManagerEmployeeGuID
				where: {
					DepartmentId: DepartmentId
				},
				include: [
					{
						model: TblProjectMapping,
						where: {
							[Op.and]: [
								{
									DailyAllocatedHours: {
										[Op.gt]: 0 // Filter employees with DailyAllocatedHours greater than 0
									}
								}
							]
						},
						include: [
							{
								model: TblProjects,
								where: {
									StartDate: { [Op.lte]: new Date() },
									EndDate: { [Op.gte]: new Date() },
									IsActive: 1
								},
								required: true // INNER JOIN to ensure only active projects are considered
							}
						],
						required: true
					},
					{
						model: TblDesignation,
						required: true
					}
				],
				order: [['CreatedAt', 'DESC']]
			});

			// Extract relevant information from the result
			const result = employees.map(async (employee) => {
				const fullName = employee.FullName;
				const { EmployeeGuID } = employee;
				const reportingManagerEmployeeGuID = employee.ReportingManagerEmployeeGuID;
				const hourlycost = employee.HourlyCost;

				// Fetch reporting manager's full name based on ReportingManagerEmployeeGuID
				const reportingManager = await this._tblBasicInfoModel.findOne({
					attributes: ['FullName'],
					where: {
						EmployeeGuID: reportingManagerEmployeeGuID
					}
				});

				let reportingManagerName = null;
				if (reportingManager) {
					reportingManagerName = reportingManager.FullName;
				}

				const designationName = employee.designation ? employee.designation.DesignationName : null;
				const { projectMappings } = employee;
				let totalAllocatedHours = 0; // Initialize total allocated hours

				if (projectMappings && projectMappings.length > 0) {
					const activeProjects = projectMappings.filter((projectMapping) => {
						const project = projectMapping.ProjectGuIdInfo || {};
						return projectMapping.EmployeesProjectMappingGuId && projectMapping.IsActive && new Date() < new Date(project['EndDate']);
					});

					// Calculate the total allocated hours across all active projects
					totalAllocatedHours = activeProjects.reduce((total, projectMapping) => {
						return total + projectMapping.DailyAllocatedHours;
					}, 0);
				}

				return {
					FullName: fullName,
					EmployeeGuID: EmployeeGuID,
					Designation: designationName,
					ReportingManagerName: reportingManagerName,
					HourlyCost: hourlycost,
					TotalAllocatedHours: totalAllocatedHours
				};
			});

			const finalResult = await Promise.all(result);

			// Filter employees based on their total allocated hours being greater than equal to than 8
			const filteredEmployees = finalResult.filter((employee) => {
				return employee.TotalAllocatedHours >= 8;
			});

			// Return the filtered employees without TotalAllocatedHours
			return filteredEmployees.map((employee) => {
				const { FullName, EmployeeGuID, Designation, ReportingManagerName, HourlyCost, TotalAllocatedHours } = employee;
				return {
					FullName,
					EmployeeGuID,
					Designation,
					ReportingManagerName,
					HourlyCost,
					TotalAllocatedHours
				};
			});
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR, claims?.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region fetch employee details,their skills and certifications
	async findEmployeeById(employeeId: string, claims: JwtToken): Promise<AppResponse> {
		try {
			const employees = await this._tblBasicInfoModel.findOne({
				attributes: [
					'FullName',
					'ReportingManagerEmployeeGuID',
					'HourlyCost',
					'Username',
					'JoiningDate',
					'TotalYearsOfExperience',
					'CommunicationEmailAddress'
				],

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
									IsActive: 1
								},
								required: true
							}
						],
						where: {
							IsActive: 1
						},
						required: false
					},
					{
						model: TblCertificationMapping,
						include: [
							{
								model: TblCertifications,
								where: {
									IsActive: 1
								},
								required: true
							}
						]
					},
					{
						model: TblDesignation,
						required: true
					},
					{
						model: TblDepartment,
						required: true
					}
				]
			});
			if (!employees) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W20);
			}

			// // Extract relevant information from the result
			const fullName = employees.FullName;
			const reportingManagerEmployeeGuID = employees.ReportingManagerEmployeeGuID;
			const hourlycost = employees.HourlyCost;
			const { Username } = employees;
			const Email = employees.CommunicationEmailAddress;
			const { JoiningDate } = employees;
			const YearsOfExperience = employees.TotalYearsOfExperience;
			const DepartmentName = employees.department ? employees.department.DepartmentName : null;

			// Fetch reporting manager's full name based on ReportingManagerEmployeeGuID
			const reportingManager = await this._tblBasicInfoModel.findOne({
				attributes: ['FullName'],
				where: {
					EmployeeGuID: reportingManagerEmployeeGuID
				}
			});

			let reportingManagerName = null;
			if (reportingManager) {
				reportingManagerName = reportingManager.FullName;
			}

			const designationName = employees.designation ? employees.designation.DesignationName : null;
			const skillMappings = employees.skillsMappings;
			let skills = [];
			if (skillMappings && skillMappings.length > 0) {
				skills = skillMappings.map((sm) => {
					return {
						SkillName: sm.SkillGuIdInfo.SkillName,
						SelfRating: sm.SelfRating,
						ReportingManagerRating: sm.ReportingManagerRating,
						SkillTags: sm.SkillGuIdInfo.SkillTagIdInfo.SkillTagName
					};
				});
			}

			const { certificationMappings } = employees;
			let Certification = [];
			if (certificationMappings && certificationMappings.length > 0) {
				Certification = certificationMappings.map((cer) => {
					return {
						CertificationName: cer.CertificationGuIdInfo.CertificationName,
						Description: cer.CertificationGuIdInfo.CertificationDescription,
						UploadedOn: cer.CreatedAt
					};
				});
			}

			const response = {
				BasicInfo: {
					FullName: fullName,
					Username: Username,
					Email: Email,
					Designation: designationName,
					JoiningDate: JoiningDate,
					ReportingManagerName: reportingManagerName,
					HourlyCost: hourlycost,
					YearsOfExperience: YearsOfExperience,
					DepartmentName: DepartmentName
				},
				Skills: skills,
				Certification: Certification
			};

			return createResponse(HttpStatus.OK, messages.S29, response);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region get employee by their average skills rating given by reporting manager

	async getEmployeesbyRating(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const employeeAvgRating = await this._skillMappingModel.findAll({
				attributes: [
					[
						this._sequelize.fn('ROUND', this._sequelize.fn('AVG', this._sequelize.cast(this._sequelize.col('ReportingManagerRating'), 'DECIMAL')), 1),
						'AverageRating'
					],

					[this._sequelize.col('employeeInfo.EmployeeGuID'), 'EmployeeGuID'],
					[this._sequelize.col('employeeInfo.FullName'), 'FullName'],
					[this._sequelize.col('employeeInfo.DepartmentId'), 'DepartmentId']
				],
				include: [
					{
						model: this._tblBasicInfoModel,
						as: 'employeeInfo',
						attributes: [],
						where: {
							DepartmentId: DepartmentId
						}
					}
				],
				group: ['employeeInfo.EmployeeGuID', 'employeeInfo.FullName', 'employeeInfo.DepartmentId']
			});

			return createResponse(HttpStatus.OK, messages.S31, employeeAvgRating);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W19, claims?.appSessionId);
		}
	}

	//#endregion

	//#region get all the employees with their billable and nonbillable working hours
	async getEmployeesbyWorkingHours(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<any> {
		try {
			const employeesWithHours = await this._monthlyInfoModel.findAll({
				where: {
					[Op.and]: [
						Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('ForMonth')), year),
						Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('ForMonth')), month)
					]
				},
				attributes: [[this._sequelize.col('EmployeeGuIDInfo.FullName'), 'FullName'], 'BillableHours', 'NonBillableHours', 'ForMonth'],
				include: [
					{
						model: TblBasicInfo,
						as: 'EmployeeGuIDInfo',
						attributes: [],
						where: {
							DepartmentId: DepartmentId
						}
					}
				]
			});

			return createResponse(HttpStatus.OK, messages.S49, employeesWithHours);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
	//#region get all the employees with their billable and nonbillable working hours
	async getEmployeesMaxBillableHours(DepartmentId: number, claims: JwtToken): Promise<any> {
		try {
			const currentDate = new Date();
			const previousMonth = new Date(currentDate);
			previousMonth.setMonth(currentDate.getMonth() - 1);

			const year = previousMonth.getFullYear();
			const month = previousMonth.getMonth() + 1;
			const employeesWithHours = await this._monthlyInfoModel.findAll({
				where: {
					[Op.and]: [
						Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('ForMonth')), year),
						Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('ForMonth')), month)
					]
				},
				attributes: [[this._sequelize.col('EmployeeGuIDInfo.FullName'), 'FullName'], 'BillableHours', 'NonBillableHours', 'ForMonth'],
				include: {
					model: TblBasicInfo,
					as: 'EmployeeGuIDInfo',
					attributes: [],
					where: {
						DepartmentId: DepartmentId
					}
				}
			});

			const maxBillableHours = Math.max(...employeesWithHours.map((employee) => employee.BillableHours));

			const employeesWithMaxBillableHours = employeesWithHours.filter((employee) => employee.BillableHours === maxBillableHours);
			return employeesWithMaxBillableHours;
			// return createResponse(HttpStatus.OK, messages.S49, employeesWithMaxBillableHours);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#endregion

	//#region  get all 9box employees position
	async getEmployeesby9b0xdata(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<any> {
		try {
			const employeesBy9BoxData = await this._monthlyInfoModel.findAll({
				where: {
					[Op.and]: [
						Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('ForMonth')), year),
						Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('ForMonth')), month)
					]
				},
				include: [
					{
						model: this._9b0xModel
					},

					{
						model: TblBasicInfo,
						where: {
							DepartmentId: DepartmentId
						},
						as: 'EmployeeGuIDInfo'
					}
				]
			});
			const allReport = employeesBy9BoxData.map((data) => data.toJSON());
			const positionData = [
				{ PositionName: 'Consistent Star', employee: [], count: 0 },
				{ PositionName: 'Rising Star', employee: [], count: 0 },
				{ PositionName: 'High Performance', employee: [], count: 0 },
				{ PositionName: 'Future Star', employee: [], count: 0 },
				{ PositionName: 'Goal Achiever', employee: [], count: 0 },
				{ PositionName: 'Solid Performance', employee: [], count: 0 },
				{ PositionName: 'Trainable Proffessional', employee: [], count: 0 },
				{ PositionName: 'Inconsistent Achiever', employee: [], count: 0 },
				{ PositionName: 'At Risk Professional', employee: [], count: 0 }
			];

			const positionIdToIndex: any = {
				1: 0,
				2: 1,
				3: 2,
				4: 3,
				5: 4,
				6: 5,
				7: 6,
				8: 7,
				9: 8
			};
			allReport.forEach((employeeMonthData) => {
				const positionId = employeeMonthData.PositionIdInfo.PositionId;
				const index = positionIdToIndex[positionId];
				positionData[index].count++;
				positionData[index].employee.push(employeeMonthData.EmployeeGuIDInfo.FullName);
			});

			return createResponse(HttpStatus.OK, messages.S32, positionData);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2, claims?.appSessionId);
		}
	}
}
