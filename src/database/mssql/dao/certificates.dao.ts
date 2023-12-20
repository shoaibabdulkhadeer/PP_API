import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { HttpStatus, Inject } from '@nestjs/common';
import { AbstractCertificatesSqlDao } from '../abstract/certificates.abstract';
import { MsSqlConstants } from '../connection/constants.mssql';
import { TblCertifications } from '../models/masters.certifications.models';
import { TblCertificationProvider } from '../models/readonly.certification-provider.models';
import { CertModel } from '@app/modules/certificates/models/certificate.model';
import { Op, Sequelize } from 'sequelize';
import { TblBasicInfo } from '../models/employees.basic-info.models';

export class CertificatesSqlDao implements AbstractCertificatesSqlDao {
	constructor(
		@Inject(MsSqlConstants.SEQUELIZE_PROVIDER) private _sequelize: Sequelize,
		@Inject(MsSqlConstants.MASTER_CERTIFICATIONS_MODEL) private readonly _masterCertificateModel: typeof TblCertifications,
		@Inject(MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL) private readonly _basicInfoModel: typeof TblBasicInfo,
		@Inject(MsSqlConstants.READONLY_CERTIFICATION_PROVIDER_MODEL) private readonly _certifivateProvider: typeof TblCertificationProvider
	) {}

	//#region get Certificates
	async getAllCertificatesDao(page?: number, limit?: number, name?: string): Promise<AppResponse> {
		try {
			const parsedPageSize = parseInt(String(limit), 10);
			const offset = (page - 1) * parsedPageSize;

			const certData = await this._masterCertificateModel.findAll({
				attributes: ['CertificationGuId', 'CertificationName', 'CertificationDescription', 'CreatedAt', 'IsActive'],
				where: {
					CertificationName: {
						[Op.like]: `%${name}%`
					}
				},
				include: [
					{
						model: this._certifivateProvider,
						attributes: ['CertificationProviderName']
					},
					{
						model: this._basicInfoModel,
						attributes: ['FullName'],
						as: 'createdByInfo'
					}
				],
				order: [['CreatedAt', 'DESC']],

				limit: parsedPageSize,
				offset: offset
			});
			const totalCertificatesCount = await this._masterCertificateModel.count({
				where: {
					CertificationName: {
						[Op.like]: `${name}%`
					}
				}
			});
			const data = { certData, totalCertificatesCount };
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async getCertificatesVerify() {
		try {
			const certData = await this._masterCertificateModel.findAll({});
			return createResponse(HttpStatus.OK, messages.S4, certData);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	//#region certification verification
	async certVerification(CertificationName: any): Promise<AppResponse> {
		try {
			const certData = await this._masterCertificateModel.findOne({ where: { CertificationName } });
			if (certData) {
				return createResponse(HttpStatus.BAD_REQUEST, messages.S4, certData);
			}
			return createResponse(HttpStatus.OK, messages.S4);
		} catch (error) {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region add Certificates
	async addCertificateDao(certificateData: CertModel): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			const addCert = await this._masterCertificateModel.create(certificateData);
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S4, addCert);
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	//#region update Certificates
	async updateCertificateDao(certificateDetails: any, certID: string): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			await this._masterCertificateModel.update({ ...certificateDetails }, { where: { CertificationGuId: certID } });
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

	//#region get certificates providers
	async getAllCertificateProvidersDao(): Promise<AppResponse> {
		try {
			const data = await this._certifivateProvider.findAll({
				attributes: ['CertificationProviderId', 'CertificationProviderName'],
				where: { IsActive: 1 }
			});
			return createResponse(HttpStatus.OK, messages.S4, data);
		} catch {
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
	//#endregion

	async updateCertificateAval(certificateDetails: any, certID: string): Promise<AppResponse> {
		const transaction = await this._sequelize.transaction();
		try {
			await this._masterCertificateModel.update({ ...certificateDetails }, { where: { CertificationGuId: certID } });
			await transaction.commit();
			return createResponse(HttpStatus.OK, messages.S4);
		} catch {
			if (transaction) {
				await transaction.rollback();
			}
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}
}
