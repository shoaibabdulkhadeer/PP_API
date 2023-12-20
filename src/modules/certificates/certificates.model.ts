import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { AbstractCertificatesSvc } from './certificates.abstract';

@Module({
	imports: [],
	controllers: [CertificatesController],
	providers: [
		{
			provide: AbstractCertificatesSvc,
			useClass: CertificatesService
		}
	]
})
export class CertificateModule {}
