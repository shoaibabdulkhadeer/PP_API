import { UpdateCertificateDto } from '@app/modules/certificates/dto/certificates.dto';
import { CertModel } from '@app/modules/certificates/models/certificate.model';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractCertificatesSqlDao {
	abstract getAllCertificatesDao(page?: number, limit?: number, name?: string): Promise<AppResponse>;
	abstract getCertificatesVerify(): Promise<AppResponse>;
	abstract certVerification(CertificationName: any): Promise<AppResponse>;
	abstract addCertificateDao(certificateData: CertModel): Promise<AppResponse>;
	abstract updateCertificateDao(certificateDetails: any, certID: any): Promise<AppResponse>;
	abstract getAllCertificateProvidersDao(): Promise<AppResponse>;
	abstract updateCertificateAval(certDetails: any, certID: string): Promise<AppResponse>;
}
