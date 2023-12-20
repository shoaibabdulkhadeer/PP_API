import { AppConfigService } from '@app/config/appconfig.service';
import { FilesAzureService } from '@app/core/container/azure-blob.service';
import AppLogger from '@app/core/logger/app-logger';
import { DatabaseService } from '@app/database/database.service';
import { AbstractProfileEmployeeDao } from '@app/database/mssql/abstract/profileEmployee.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messageFactory, messages } from '@app/shared/messages.shared';
import { HttpStatus, Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify';
import { promisify } from 'util';
import { AbstractProfileEmployeeSvc } from './ProfileEmployee.abstract';
import { CreateCertificationDto } from './dto/createCertification.dto';
import { JwtToken } from '../auth/models/jwt_token.model';
import { projectFetchDto } from './dto/projectFetch.dto';

const stringifyAsync: any = promisify(stringify);

@Injectable()
export class ProfileEmployeeService implements AbstractProfileEmployeeSvc {
	private readonly _profileSqlTxn: AbstractProfileEmployeeDao;

	constructor(
		private readonly _appConfigSvc: AppConfigService,
		private readonly _fileAzureService: FilesAzureService,
		_dbSvc: DatabaseService,
		readonly _loggerSvc: AppLogger
	) {
		this._profileSqlTxn = _dbSvc.profileSqlTxn;
	}

	// Convert Number to Long format Month Name
	getMonthStringFromNumber(dateStr: number) {
		const inputDate = new Date(dateStr);
		const month = inputDate.toLocaleString('default', { month: 'long' });
		const year = inputDate.getFullYear();
		return `${month} ${year}`;
	}

	// 1. Get an Employee's Details by EmployeeGuID -- SERVICE
	//#region  1. Get an Employee's Details by EmployeeGuID -- SERVICE
	async getEmployeeDetailsById(id: string): Promise<AppResponse> {
		return await this._profileSqlTxn.getEmployeeByID(id);
	}
	//#endregion

	// 2. Get all projects for an Employee by EmployeeGuID -- SERVICE
	//#region 2. Get all projects for an Employee by EmployeeGuID -- CONTROLLER
	async getProjectsById(claims: JwtToken, projectFetchBody: projectFetchDto, projectName: string, pageId: number): Promise<AppResponse> {
		// Check if EmployeeGuID in claims exist or not
		const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(claims.EmployeeGuID);
		if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
			return checkEmployeeIDResponse;
		}

		// If role of user is RM or Admin, then EmployeeGuID is mandatory in projectFetchBody
		if (claims.RoleName !== 'Employee' && !projectFetchBody.EmployeeGuID) {
			return createResponse(HttpStatus.BAD_REQUEST, messages.W46);
		}

		// If role of user is Employee, then EmployeeGuID is not allowed in projectFetchBody
		if (claims.RoleName === 'Employee' && projectFetchBody.EmployeeGuID) {
			return createResponse(HttpStatus.BAD_REQUEST, messages.W47);
		}

		// projectFetchBody have EmployeeGuID, so pass EmployeeGuID from projectFetchBody to fetch project Details
		if (projectFetchBody.EmployeeGuID) {
			const checkEmployeeIDForAdminResponse = await this._profileSqlTxn.checkEmployeeID(projectFetchBody.EmployeeGuID);
			if (checkEmployeeIDForAdminResponse.code === HttpStatus.BAD_REQUEST) {
				return checkEmployeeIDForAdminResponse;
			}
			return await this._profileSqlTxn.getEmployeeProjectsById(projectFetchBody.EmployeeGuID, projectFetchBody, projectName, pageId);
		}

		// projectFetchBody does not have EmployeeGuID, so pass EmployeeGuID from claims to fetch project Details
		return await this._profileSqlTxn.getEmployeeProjectsById(claims.EmployeeGuID, projectFetchBody, projectName, pageId);
	}
	//#endregion

	// 3. Get an Employee's Skills by EmployeeGuID -- SERVICE
	//#region 3. Get an Employee's Skills by EmployeeGuID -- SERVICE
	async getSkillsById(id: string): Promise<AppResponse> {
		const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(id);
		if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
			return checkEmployeeIDResponse;
		}
		return await this._profileSqlTxn.getSkillsByEmployeeId(id);
	}
	//#endregion

	// 4. Patch an Employee's Skill self rating -- SERVICE
	//#region 4. Patch an Employee's Skill self rating -- SERVICE
	async patchSkillById(patchBody: { SelfRating: number; SkillGuId: string }, claims: JwtToken): Promise<AppResponse> {
		const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(claims.EmployeeGuID);
		if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
			return checkEmployeeIDResponse;
		}
		return await this._profileSqlTxn.patchSkillsByEmployeeId(patchBody, claims);
	}
	//#endregion

	// 5. Get all Certifiates -- CONTROLLER
	//#region 5. Get all Certificates -- SERVICE
	async getAllCertificates(): Promise<AppResponse> {
		return await this._profileSqlTxn.getAllCertificatesFromMaster();
	}
	//#endregion

	// 6. Get an Employee Certifiates by EmployeeGuID -- SERVICE
	//#region 6. Get an Employee Certificates by EmployeeGuID -- SERVICE
	async getCertificatesById(id: string): Promise<AppResponse> {
		const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(id);
		if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
			return checkEmployeeIDResponse;
		}
		return await this._profileSqlTxn.getCertificatesById(id);
	}
	//#endregion

	// 7. Post an Employee Certifiation by EmployeeGuID -- SERVICE
	//#region 7. Post an Employee Certification by EmployeeGuID -- SERVICE
	async postCertificationById(file: any, body: CreateCertificationDto, claims: JwtToken): Promise<AppResponse> {
		// Check if EmployeeGuId whose certificate is uploaded, exists in DB
		const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(body.EmployeeGuID);
		if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
			return checkEmployeeIDResponse;
		}
		// Check if File Uploaded is Empty
		if (!file) {
			return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W3, ['File']));
		}
		// Get All Available Certifications
		const allCertifications = await this.getAllCertificates();
		if (allCertifications.code === HttpStatus.BAD_REQUEST) {
			return allCertifications;
		}
		// Create an array of CertificationGuId to check Passed CertificationGuId Validity
		const getCertificateIDs = allCertifications.data.map((certificate: any) => certificate.CertificationGuId);
		if (!getCertificateIDs.includes(body.CertificationGuId)) {
			return createResponse(HttpStatus.BAD_REQUEST, messages.W34);
		}
		// Post Certification to AZURE BLOB STORAGE ACCOUNT
		const azureReturn = await this._fileAzureService.uploadFile(file, body);
		if (azureReturn.code !== HttpStatus.OK) {
			return azureReturn;
		}
		const postCertificateResponse = await this._profileSqlTxn.postCertificateById(body, claims);
		return postCertificateResponse;
	}
	//#endregion

	// 8. Download an Employee Certifiation by EmployeeGuID and CertificationGuId  -- SERVICE
	//#region 8. Download an Employee Certification by EmployeeGuID and CertificationGuId  -- SERVICE
	async downloadCertificationById(body: CreateCertificationDto) {
		try {
			const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(body.EmployeeGuID);
			if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
				return checkEmployeeIDResponse;
			}
			// Get All Available Certifications
			const allCertifications = await this.getAllCertificates();
			if (allCertifications.data.length === 0) {
				return allCertifications;
			}
			// Create an array of CertificationGuId to check Passed CertificationGuId Validity
			const getCertificateIDs = allCertifications.data.map((certificate: any) => certificate.CertificationGuId);
			if (!getCertificateIDs.includes(body.CertificationGuId)) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W34);
			}
			const certificateFileNameData = await this._profileSqlTxn.downloadCertificateById(body);
			if (!certificateFileNameData.data || certificateFileNameData.data.length === 0) {
				return createResponse(HttpStatus.BAD_REQUEST, messageFactory(messages.W38));
			}
			const azureDownloadReturn = await this._fileAzureService.downloadFileFromBlob(body);
			return azureDownloadReturn;
		} catch (errorDownloadFile) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	// 9. Get an Employee Monthly Performance Report by EmployeeGuID -- SERVICE
	//#region 9. Get an Employee Monthly Performance Report by EmployeeGuID -- SERVICE
	async getEmployeePerformanceReportById(id: string): Promise<AppResponse> {
		try {
			const checkEmployeeIDResponse = await this._profileSqlTxn.checkEmployeeID(id);
			if (checkEmployeeIDResponse.code === HttpStatus.BAD_REQUEST) {
				return checkEmployeeIDResponse;
			}
			const dbRes = await this._profileSqlTxn.getMonthlyPerformanceById(id);
			if (dbRes.data && dbRes.data.length === 0) {
				return dbRes;
			}
			const csvData = [['SlNo', 'Month', 'Billable Hours', 'Non-Billable Hours', '9Box-Position', 'Remarks']];
			const { data } = dbRes;

			data.forEach((reportRow: any, index: number) => {
				const obj: any = {
					idx: index + 1,
					Month: this.getMonthStringFromNumber(reportRow.ForMonth),
					BillableHours: reportRow.BillableHours,
					NonBillableHours: reportRow.NonBillableHours,
					BoxName: reportRow.PositionIdInfo.BoxName,
					Remarks: reportRow.Remarks
				};
				const arr: any = Object.values(obj);
				csvData.push(arr);
			});
			const stringifydata = await stringifyAsync(csvData);
			return createResponse(HttpStatus.OK, messages.S4, stringifydata);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
