import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { AbstractEmployeeSvc } from './employee.abstract';

@Module({
	controllers: [EmployeeController],
	providers: [
		{
			provide: AbstractEmployeeSvc,
			useClass: EmployeeService
		}
	]
})
export class EmployeeModule {}
