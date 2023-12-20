import { Module, ValidationPipe } from '@nestjs/common';

import { AppController } from '@app/modules/app/app.controller';
import { AppService } from '@app/modules/app/app.service';
import { AuthModule } from '@app/modules/auth/auth.module';
import { CoreModule } from '@app/core/core.module';
import { EmpReportModule } from '../monthlyEmployeeReport/monthlyEmployeeReport.module';
import { DashBoardModule } from '../dashboard/dashboard.module';
import { SkillModule } from '../skills/skills.module';
import { ProjectsModule } from '../projects/projects.module';
import { CertificateModule } from '../certificates/certificates.model';
import { EmployeeModule } from '../employee/employee.module';
import { ProfileEmployeeModule } from '../ProfileEmployee/ProfileEmployee.module';
import { MastersModule } from '../masters/masters.module';

@Module({
	imports: [
		CoreModule,
		AuthModule,
		EmpReportModule,
		DashBoardModule,
		SkillModule,
		ProjectsModule,
		CertificateModule,
		EmployeeModule,
		ProfileEmployeeModule,
		MastersModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
