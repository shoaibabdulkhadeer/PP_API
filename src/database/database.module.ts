import { Module } from '@nestjs/common';
import { sequelizeProvider } from './mssql/connection/connection.mssql';
import { msSqlDBModelsProvider } from './mssql/connection/msSqlDBModelsProvider';
import { DatabaseService } from './database.service';
import { AbstractAuthSqlDao } from './mssql/abstract/auth.abstract';
import { AuthSqlDao } from './mssql/dao/auth.dao';
import { AbstractEmpReportSqlDao } from './mssql/abstract/monthlyEmployeeReport.abstract';
import { EmpReportSqlDao } from './mssql/dao/monthlyEmployeeReport.dao';
import { AbstractDashBoardSqlDao } from './mssql/abstract/dashboard.abstract';
import { DashBoardSqlDao } from './mssql/dao/dashboard.dao';
import { AbstractSkillSqlDao } from './mssql/abstract/skills.abstract';
import { SkillSqlDao } from './mssql/dao/skills.dao';
import { AbstractProjectsSqlDao } from './mssql/abstract/projects.abstract';
import { ProjectsDao } from './mssql/dao/projects.dao';
import { AbstractCertificatesSqlDao } from './mssql/abstract/certificates.abstract';
import { CertificatesSqlDao } from './mssql/dao/certificates.dao';

import { AbstractEmployee } from './mssql/abstract/employee.abstract';
import { EmployeeDao } from './mssql/dao/employee.dao';
import { AbstractMaster } from './mssql/abstract/masters.abstract';
import { MastersDao } from './mssql/dao/masters.dao';
import { ProfileEmployeeDao } from './mssql/dao/profileEmployee.dao';
import { AbstractProfileEmployeeDao } from './mssql/abstract/profileEmployee.abstract';

@Module({
	providers: [
		...sequelizeProvider,
		...msSqlDBModelsProvider,
		DatabaseService,
		{
			provide: AbstractAuthSqlDao,
			useClass: AuthSqlDao
		},
		{
			provide: AbstractEmpReportSqlDao,
			useClass: EmpReportSqlDao
		},
		{
			provide: AbstractDashBoardSqlDao,
			useClass: DashBoardSqlDao
		},
		{
			provide: AbstractSkillSqlDao,
			useClass: SkillSqlDao
		},
		{
			provide: AbstractProjectsSqlDao,
			useClass: ProjectsDao
		},
		{
			provide: AbstractCertificatesSqlDao,
			useClass: CertificatesSqlDao
		},
		{
			provide: AbstractEmployee,
			useClass: EmployeeDao
		},
		{
			provide: AbstractProfileEmployeeDao,
			useClass: ProfileEmployeeDao
		},
		{
			provide: AbstractMaster,
			useClass: MastersDao
		}
	],
	exports: [
		DatabaseService,
		...msSqlDBModelsProvider,
		{
			provide: AbstractAuthSqlDao,
			useClass: AuthSqlDao
		},
		{
			provide: AbstractEmpReportSqlDao,
			useClass: EmpReportSqlDao
		},
		{
			provide: AbstractDashBoardSqlDao,
			useClass: DashBoardSqlDao
		},
		{
			provide: AbstractSkillSqlDao,
			useClass: SkillSqlDao
		},
		{
			provide: AbstractProjectsSqlDao,
			useClass: ProjectsDao
		},
		{
			provide: AbstractCertificatesSqlDao,
			useClass: CertificatesSqlDao
		},
		{
			provide: AbstractMaster,
			useClass: MastersDao
		},
		{
			provide: AbstractProfileEmployeeDao,
			useClass: ProfileEmployeeDao
		}
	]
})
export class DatabaseModule {}
