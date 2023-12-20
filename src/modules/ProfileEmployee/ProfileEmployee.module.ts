import { Module } from '@nestjs/common';
import { ProfileEmployeeController } from './ProfileEmployee.controller';
import { AbstractProfileEmployeeSvc } from './ProfileEmployee.abstract';
import { ProfileEmployeeService } from './ProfileEmployee.service';
import { FilesAzureService } from '@app/core/container/azure-blob.service';

@Module({
	controllers: [ProfileEmployeeController],
	providers: [
		{
			provide: AbstractProfileEmployeeSvc,
			useClass: ProfileEmployeeService
		},
		FilesAzureService
	]
})
export class ProfileEmployeeModule {}
