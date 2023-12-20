import { AppConfigService } from '@app/config/appconfig.service';
import { CreateCertificationDto } from '@app/modules/ProfileEmployee/dto/createCertification.dto';
import { AppResponse, createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { BlobClient, BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { HttpStatus, Injectable } from '@nestjs/common';
import AppLogger from '../logger/app-logger';

@Injectable()
export class FilesAzureService {
	constructor(
		private readonly configService: AppConfigService,
		readonly _loggerSvc: AppLogger
	) {}
	private containerName: string;

	private async getBlobServiceInstance() {
		const blobString = this.configService.get('blobStorage').blobAccountConnectionString;
		const blobClientService = BlobServiceClient.fromConnectionString(blobString);
		return blobClientService;
	}

	private async getBlobClient(imageName: string): Promise<BlockBlobClient> {
		const blobService = await this.getBlobServiceInstance();
		const { containerName } = this;
		const containerClient = blobService.getContainerClient(containerName);
		const blockBlobClient = containerClient.getBlockBlobClient(imageName);
		return blockBlobClient;
	}

	// 7. Post an Employee Certifiation by EmployeeGuID -- AZURE SERVICE
	public async uploadFile(file: any, body: CreateCertificationDto): Promise<AppResponse> {
		try {
			this.containerName = this.configService.get('blobStorage').blobCertificateContainer;
			const extension = file.originalname.split('.').pop();
			const file_name = `${body.CertificationGuId}.` + extension;
			const blockBlobClient = await this.getBlobClient(`${body.EmployeeGuID}/` + file_name);
			const fileUrl = blockBlobClient.url;
			const uploadRes = await blockBlobClient.uploadData(file.buffer);
			return createResponse(HttpStatus.OK, messages.S4, fileUrl);
		} catch (error) {
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
		}
	}

	// 8. Download an Employee Certifiation by EmployeeGuID and CertificationGuId  -- AZURE SERVICE
	async downloadFileFromBlob(body: CreateCertificationDto) {
		try {
			this.containerName = this.configService.get('blobStorage').blobCertificateContainer;
			const blobClient = await this.getBlobClient(`${body.EmployeeGuID}/${body.CertificationGuId}.pdf`);
			const blobDownload = await blobClient.download();
			return blobDownload.readableStreamBody;
		} catch (error) {
			if (error.code && error.code === 'BlobNotFound') {
				this._loggerSvc.error(error.stack, HttpStatus.BAD_REQUEST);
				return createResponse(HttpStatus.BAD_REQUEST, messages.W39);
			}
			this._loggerSvc.error(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
			return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.W37);
		}
	}
}
