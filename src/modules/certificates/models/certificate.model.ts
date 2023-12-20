export interface CertModel {
	CertificationGuId: string;
	CertificationName: string;
	CertificationDescription: string;
	IsActive: boolean;
	CertificationProviderId: number;
	CreatedBy: string;
	CreatedAt: number;
	UpdatedBy?: string;
	UpdatedAt?: number;
}
