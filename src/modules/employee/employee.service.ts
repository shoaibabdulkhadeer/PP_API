import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractEmployee } from '@app/database/mssql/abstract/employee.abstract';
import { DatabaseService } from '@app/database/database.service';
import { AppConfigService } from '@app/config/appconfig.service';
import AppLogger from '@app/core/logger/app-logger';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { AbstractEmployeeSvc } from './employee.abstract';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from './dto/employee.dto';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { AddSkillDto, PatchSkillRatingDto } from './dto/skill.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

@Injectable()
export class EmployeeService implements AbstractEmployeeSvc {
	private readonly _employeeTxn: AbstractEmployee;
	private readonly _transporter: nodemailer.Transporter;
	constructor(
		private readonly _appConfigSvc: AppConfigService,
		_dbSvc: DatabaseService,
		readonly _loggerSvc: AppLogger
	) {
		this._employeeTxn = _dbSvc.employeeSqlTxn;

		this._transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: _appConfigSvc.get('emailResponse'),
				pass: _appConfigSvc.get('emailResponse')
			}
		});
	}

	//#region post Add new User
	async addBasicInfo(infoDetails: CreateEmployeeDto, claims: JwtToken): Promise<AppResponse> {
		try {
			const mailSender = this._appConfigSvc.get('emailResponse');
			const mail = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: mailSender.senderMail,
					pass: mailSender.senderPassword
				}
			});
			const { FullName, Username, CommunicationEmailAddress, JoiningDate, EmployeeID, RoleID } = infoDetails;

			const findbyusername = await this._employeeTxn.findbyUsername(Username);
			const findByEmployeeG7Id = await this._employeeTxn.finduserByEmployeeG7Id(EmployeeID);

			if (findbyusername || findByEmployeeG7Id) {
				return createResponse(HttpStatus.BAD_REQUEST, findbyusername ? messages.W18 : messages.W24);
			}
			function generatePassword(length: number = 8): string {
				const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				return 'Perfpulse@' + Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
			}

			const generatedPassword = generatePassword();
			const hashedPassword = await bcrypt.hash(generatedPassword, 10);
			const joiningDateTimestamp = new Date(JoiningDate).getTime();
			const generatedEmployeeGuID = uuidv4();

			const basicinfoData = {
				...infoDetails,
				EmployeeGuID: generatedEmployeeGuID,
				JoiningDate: joiningDateTimestamp,
				IsActive: true,
				Password: hashedPassword,
				CreatedBy: claims.EmployeeGuID,
				CreatedAt: Date.now(),
				UpdatedBy: null,
				UpdatedAt: unix_ts_now()
			};

			const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;
			const time = unix_ts_now();
			const empdata = RoleID.map((role) => ({
				EmployeeRoleGuID: uuidv4(),
				EmployeeGuID: generatedEmployeeGuID,
				RoleID: role,
				IsDefault: role === 3,
				EffectiveFrom: time,
				EffectiveTill: time + oneYearInMilliseconds,
				CreatedBy: claims.EmployeeGuID,
				CreatedAt: Date.now(),
				UpdatedBy: null,
				UpdatedAt: unix_ts_now()
			}));

			const postedData = await this._employeeTxn.postBasicInfo(basicinfoData, empdata);

			const responseData = {
				...postedData,
				EmployeeGuID: generatedEmployeeGuID
			};

			const mailobj = {
				EmailLogsMasterGuid: uuidv4(),
				EmailLoggedDateTime: unix_ts_now(),
				EmailToComma: CommunicationEmailAddress,
				EmailCcComma: null,
				EmailBccComma: null,
				EmailSubject: 'Welcome to Performance Pulse App',
				EmailBody: `Dear ${FullName},\n\nWelcome to Performance Pulse App! 😃👋\n\nCheck Out Our Website ${mailSender.deployedWebsite} \n\nYour username: ${Username}\n\nYour password : ${generatedPassword}\n\nThank you!\n\nBest Regards,\n\nTeam -Performance Pulse`
			};

			// Sending the email
			const mailOptions = {
				from: 'PerfomancePulse@gmail.com',
				to: mailobj.EmailToComma,
				subject: mailobj.EmailSubject,
				text: mailobj.EmailBody
			};

			try {
				// Sending the email
				const info = await mail.sendMail(mailOptions);

				if (info.rejected && info.rejected.length > 0) {
					const rejectionReason = info.rejected[0].response;
					if (rejectionReason.includes('Recipient address rejected')) {
						return createResponse(HttpStatus.BAD_REQUEST, 'Invalid email address');
					}
				}
				await this._employeeTxn.addEmailLog(mailobj);
			} catch {
				return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'Error sending email');
			}

			return responseData;
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region  UpdateSVC
	async updateBasicInfo(id: string, infoDetails: any, claims: JwtToken): Promise<any> {
		try {
			const FoundUserById = await this._employeeTxn.findbyEmpguidbasic(id);
			if (!FoundUserById) {
				return createResponse(HttpStatus.BAD_REQUEST, 'User not found');
			}

			if (infoDetails.Username) {
				const findbyusername = await this._employeeTxn.findbyUsername(infoDetails.Username, id);
				if (findbyusername) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W18);
				}
			}

			if (infoDetails.EmployeeID) {
				const findByEmployeeG7Id = await this._employeeTxn.finduserByEmployeeG7Id(infoDetails.EmployeeID, id);
				if (findByEmployeeG7Id) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W24);
				}
			}

			const fields = [
				'FullName',
				'Username',
				'CommunicationEmailAddress',
				'EmployeeID',
				'JoiningDate',
				'TotalYearsOfExperience',
				'DesignationId',
				'DepartmentId',
				'ReportingManagerEmployeeGuID',
				'HourlyCost'
			];
			// Getting Updateded Data
			const upDataEmpInfo: any = {};
			fields.forEach((field) => {
				if (Object.prototype.hasOwnProperty.call(infoDetails, field)) {
					upDataEmpInfo[field] = infoDetails[field];
				}
			});

			if (upDataEmpInfo.JoiningDate) {
				upDataEmpInfo.JoiningDate = new Date(upDataEmpInfo.JoiningDate).getTime();
			}

			upDataEmpInfo.UpdatedBy = claims.EmployeeGuID;
			upDataEmpInfo.UpdatedAt = unix_ts_now();
			await this._employeeTxn.updateInfo(id, upDataEmpInfo);

			const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000; // Number of milliseconds in a year

			if (infoDetails?.RoleID?.length) {
				const getuserRoles = await this._employeeTxn.getUserRolesDao(id);
				const { RoleID } = infoDetails;
				const time = Math.floor(+new Date() / 1000);
				const empdata = [];
				let isRmRole = false;
				for (let i = 0; i < RoleID.length; i++) {
					const generatedEmployeeRoleGuID = uuidv4();
					if (RoleID[i] === 2) {
						isRmRole = true;
					}
					const EmpRoleData = {
						EmployeeRoleGuID: generatedEmployeeRoleGuID,
						EmployeeGuID: id,
						RoleID: RoleID[i],
						IsDefault: RoleID[i] === 3 ? true : false,
						EffectiveFrom: time,
						EffectiveTill: time + oneYearInMilliseconds,
						CreatedBy: claims.EmployeeGuID,
						CreatedAt: unix_ts_now(),
						UpdatedBy: claims.EmployeeGuID,
						UpdatedAt: unix_ts_now()
					};
					empdata.push(EmpRoleData);
				}

				// Update roles
				await this._employeeTxn.updateRole(empdata, isRmRole, id);
				return getuserRoles;
			}
			return createResponse(HttpStatus.OK, messages.S40);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Status UpdateStatusSvc API
	async statusBasicInfo(id: string, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._employeeTxn.statusUpdate(id, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Get employeeSvc
	async getAllUsers(fullName, departmentName, designationName, page, limit, claims: JwtToken): Promise<AppResponse> {
		try {
			const getallusers = await this._employeeTxn.getAllUsers(fullName, departmentName, designationName, page, limit, claims);
			return getallusers;
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getEmployeeProjectsSVc
	async getEmpProjects(id: string): Promise<AppResponse> {
		try {
			return await this._employeeTxn.getEmpProjectsDao(id);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Find Employee Skill
	async findEmployeeByIdSvcc(employeeId: string, claims: JwtToken): Promise<any> {
		try {
			return await this._employeeTxn.findEmployeeByIdc(employeeId, claims);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR, claims.appSessionId);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region getEmployee All Roles
	async getEmpAllRolesSvc(id: any): Promise<AppResponse> {
		try {
			return await this._employeeTxn.getEmployeeAllRolesDao(id);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region Deactivating skill of an employee
	async deleteSkillMappingSvc(SkillMappingGuId: string, claims: JwtToken): Promise<any> {
		try {
			return await this._employeeTxn.deleteSkillMapping(SkillMappingGuId, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region adding new skill to the employee
	async addSkillToEmployeeSvc(employeeGuID: string, addSkillDto: AddSkillDto, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._employeeTxn.addSkillToEmployee(employeeGuID, addSkillDto, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region updating rm rating of the employee
	async patchSkillRating(SkillMappingGuId: string, patchDto: PatchSkillRatingDto, claims: JwtToken): Promise<AppResponse> {
		try {
			return await this._employeeTxn.patchSkillRating(SkillMappingGuId, patchDto, claims);
		} catch (error) {
			this._loggerSvc.error(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
