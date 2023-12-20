import { Injectable } from '@nestjs/common';
import { AbstractAuthSqlDao } from './mssql/abstract/auth.abstract';
import { AbstractEmpReportSqlDao } from './mssql/abstract/monthlyEmployeeReport.abstract';
import { AbstractDashBoardSqlDao } from './mssql/abstract/dashboard.abstract';
import { AbstractSkillSqlDao } from './mssql/abstract/skills.abstract';
import { AbstractProjectsSqlDao } from './mssql/abstract/projects.abstract';
import { AbstractCertificatesSqlDao } from './mssql/abstract/certificates.abstract';
import { AbstractEmployee } from './mssql/abstract/employee.abstract';
import { AbstractProfileEmployeeDao } from './mssql/abstract/profileEmployee.abstract';
import { AbstractMaster } from './mssql/abstract/masters.abstract';

@Injectable()
export class DatabaseService {
	constructor(
		public authSqlTxn: AbstractAuthSqlDao,
		public dashboardSqlTxn: AbstractDashBoardSqlDao,
		public empReportSqlTxn: AbstractEmpReportSqlDao,
		public skillSqlTxn: AbstractSkillSqlDao,
		public projectsTxn: AbstractProjectsSqlDao,
		public certSqlTxn: AbstractCertificatesSqlDao,
		public employeeSqlTxn: AbstractEmployee,
		public profileSqlTxn: AbstractProfileEmployeeDao,
		public mastersTxn: AbstractMaster
	) {}
}
