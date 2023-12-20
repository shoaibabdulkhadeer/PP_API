import { HttpStatus, Injectable } from '@nestjs/common';
import { AbstractCertificatesSvc } from './certificates.abstract';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { DatabaseService } from '@app/database/database.service';
import { AbstractCertificatesSqlDao } from '@app/database/mssql/abstract/certificates.abstract';
import { messages } from '@app/shared/messages.shared';
import { CertificateDto, UpdateCertificateDto } from './dto/certificates.dto';
import { v4 as uuidv4 } from 'uuid';
import { unix_ts_now } from '@app/core/utils/timestamp.utils';
import { CertModel } from './models/certificate.model';
import { JwtToken } from '../auth/models/jwt_token.model';

@Injectable()
export class CertificatesService implements AbstractCertificatesSvc {
	private readonly certDao: AbstractCertificatesSqlDao;
	constructor(readonly _dbSvc: DatabaseService) {
		this.certDao = _dbSvc.certSqlTxn;
	}

	//#region get all Certificates
	async getCertificatesSvc(page: number, limit: number, name: string): Promise<AppResponse> {
		try {
			return this.certDao.getAllCertificatesDao(page, limit, name);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region add Certificate
	async addCertificateSvc(certificateDetails: CertificateDto, claims: JwtToken): Promise<AppResponse> {
		try {
			const verRes = await this.certDao.certVerification(certificateDetails.CertificationName);
			if (verRes.code !== HttpStatus.OK && verRes.code !== HttpStatus.INTERNAL_SERVER_ERROR) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
			}
			const certificateData: CertModel = {
				CertificationGuId: uuidv4(),
				CertificationName: certificateDetails.CertificationName,
				CertificationDescription: certificateDetails.CertificationDescription,
				IsActive: true,
				CertificationProviderId: certificateDetails.CertificationProviderId,
				CreatedBy: claims.EmployeeGuID,
				CreatedAt: unix_ts_now()
			};
			return await this.certDao.addCertificateDao(certificateData);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region update Certificate
	async updateCertificateSvc(certificateDetails: UpdateCertificateDto, claims: JwtToken, certID: any): Promise<AppResponse> {
		try {
			if (Object.keys(certificateDetails)?.length < 1) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.W5);
			}

			const updateDetails: any = {
				UpdatedBy: claims.EmployeeGuID,
				UpdatedAt: unix_ts_now()
			};
			if (certificateDetails.CertificationName) {
				const verRes = await this.certDao.certVerification(certificateDetails.CertificationName);
				if (verRes.code !== HttpStatus.OK && verRes.code !== HttpStatus.INTERNAL_SERVER_ERROR) {
					return createResponse(HttpStatus.BAD_REQUEST, messages.W7);
				}
				updateDetails.CertificationName = certificateDetails.CertificationName;
			}

			if (certificateDetails.CertificationDescription) {
				updateDetails.CertificationDescription = certificateDetails.CertificationDescription;
			}

			if (certificateDetails.CertificationProviderId) {
				updateDetails.CertificationProviderId = certificateDetails.CertificationProviderId;
			}
			return this.certDao.updateCertificateDao(updateDetails, certID);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region certificate providers
	async getCertificateProviderSvc(): Promise<AppResponse> {
		try {
			return this.certDao.getAllCertificateProvidersDao();
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region certificate availability
	async updateCertAvlSvc(claims: JwtToken, certID: string): Promise<AppResponse> {
		try {
			const certDetails = await this.certDao.getCertificatesVerify();
			const data = certDetails.data.filter((certificate: any) => certificate.CertificationGuId === certID);
			const updatedCert = {
				IsActive: !data[0].IsActive,
				UpdatedBy: claims.EmployeeGuID,
				UpdatedAt: unix_ts_now()
			};
			return await this.certDao.updateCertificateAval(updatedCert, certID);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion
}
