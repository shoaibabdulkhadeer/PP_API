import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbstractCertificatesSvc } from './certificates.abstract';
import { CertificateDto, UpdateCertificateDto } from './dto/certificates.dto';
import { Authorize } from '@app/core/decorators/authorization.decorator';
import { HasRoles } from '@app/core/decorators/roles.decorator';
import { RoleGroup } from '@app/core/enums/app-role.enum';
import { log } from 'winston';

@Controller('certificates')
@ApiBearerAuth()
@ApiTags('Certificates')
export class CertificatesController {
	constructor(private readonly certificatesSercive: AbstractCertificatesSvc) {}

	//#region get certificates
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get')
	async getCertificates(@Query('page') page: number, @Query('name') name: any, @Query('limit') limit = 10) {
		return await this.certificatesSercive.getCertificatesSvc(page, limit, name);
	}
	//#endregion

	//#region add certifivates
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Post('add')
	async postCertificate(@Body() certificateDetails: CertificateDto, @Req() req: any) {
		return await this.certificatesSercive.addCertificateSvc(certificateDetails, req.claims);
	}
	//#endregion

	//#region update certificates
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('update/:certID')
	async updateCertificate(@Body() certificateDetails: UpdateCertificateDto, @Param('certID') certID: string, @Req() req: any) {
		return await this.certificatesSercive.updateCertificateSvc(certificateDetails, req.claims, certID);
	}
	//#endregion

	//#region get certificate providers
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Get('get/providers')
	async getCertificateProvider() {
		return await this.certificatesSercive.getCertificateProviderSvc();
	}
	//#endregion

	//#region certificate vailability
	@Authorize()
	@HasRoles(RoleGroup.RM_ADMIN)
	@Patch('update/Avil/:certID')
	async updateCertificateAvailability(@Param('certID') certID: string, @Req() req: any) {
		return await this.certificatesSercive.updateCertAvlSvc(req.claims, certID);
	}
	//#endregion
}
