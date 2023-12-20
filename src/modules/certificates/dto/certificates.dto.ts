import { IsNotEmpty, IsOptional } from 'class-validator';

export class CertificateDto {
	@IsNotEmpty()
	CertificationName: string;

	@IsNotEmpty()
	CertificationDescription: string;

	@IsNotEmpty()
	CertificationProviderId: number;
}
export class UpdateCertificateDto {
	@IsOptional()
	CertificationName: string;

	@IsOptional()
	CertificationDescription: string;

	@IsOptional()
	CertificationProviderId: number;
}
