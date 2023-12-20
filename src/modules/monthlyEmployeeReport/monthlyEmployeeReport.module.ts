import { Module } from '@nestjs/common';
import { EmpReportController } from './monthlyEmployeeReport.controller';
import { AbstractEmpReportSvc } from './monthlyEmployeeReport.abstract';
import { EmpReportService } from './monthlyEmployeeReport.service';

@Module({
	imports: [],
	controllers: [EmpReportController],
	providers: [
		{
			provide: AbstractEmpReportSvc,
			useClass: EmpReportService
		}
	]
})
export class EmpReportModule {}
