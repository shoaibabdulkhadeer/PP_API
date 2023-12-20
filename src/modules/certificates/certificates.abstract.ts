import { AppResponse } from '@app/shared/appresponse.shared';
import { CertificateDto, UpdateCertificateDto } from './dto/certificates.dto';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractCertificatesSvc {
	abstract getCertificatesSvc(page: number, limit: number, name: string): Promise<AppResponse>;
	abstract addCertificateSvc(certificateDetails: CertificateDto, claims: JwtToken): Promise<AppResponse>;
	abstract updateCertificateSvc(certificateDetails: UpdateCertificateDto, claims: JwtToken, certID: string): Promise<AppResponse>;
	abstract getCertificateProviderSvc(): Promise<AppResponse>;
	abstract updateCertAvlSvc(claims: JwtToken, certID: string): Promise<AppResponse>;
}
