import { TblBasicInfo } from '../models/employees.basic-info.models';
import { TblCertificationMapping } from '../models/employees.certification-mapping.models';
import { TblMonthlyPerformanceInfo } from '../models/employees.monthly-performance-info.models';
import { TblProjectMapping } from '../models/employees.project-mapping.models';
import { EmployeesTblRoles } from '../models/employees.roles.models';
import { TblSkillMapping } from '../models/employees.skill-mapping.models';
import { TblAppSessions } from '../models/logs.app-sessions.models';
import { Tbl_EmailLogsMaster } from '../models/logs.emailLogsMaster.models';
import { TblDesignation } from '../models/master.designation.models';
import { TblProjects } from '../models/master.projects.model';
import { MasterRoles } from '../models/master.roles.models';
import { TblSkills } from '../models/master.skill.models';
import { TblCertifications } from '../models/masters.certifications.models';
import { MsSqlConstants } from './constants.mssql';

const msSqlDBModelsProvider = [
		// EMPLOYEES MODELS PROVIDER
		{
			provide: MsSqlConstants.EMPLOYEES_BASIC_INFO_MODEL,
			useValue: TblBasicInfo
		},
		{
			provide: MsSqlConstants.EMPLOYEES_CERTIFICATION_MAPPING_MODEL,
			useValue: TblCertificationMapping
		},
		{
			provide: MsSqlConstants.EMPLOYEES_MONTHLY_PERFORMANCE_INFO_MODEL,
			useValue: TblMonthlyPerformanceInfo
		},
		{
			provide: MsSqlConstants.EMPLOYEES_PROJECT_MAPPING_MODEL,
			useValue: TblProjectMapping
		},
		{
			provide: MsSqlConstants.EMPLOYEES_ROLES_MODEL,
			useValue: EmployeesTblRoles
		},
		{
			provide: MsSqlConstants.EMPLOYEES_SKILL_MAPPING_MODEL,
			useValue: TblSkillMapping
		},

		// LOGS MODELS PROVIDER
		{
			provide: MsSqlConstants.LOGS_APP_SESSIONS_MODEL,
			useValue: TblAppSessions
		},
		{
			provide: MsSqlConstants.LOGS_EMAIL_LOGS_MASTER,
			useValue: Tbl_EmailLogsMaster
		},

		// MASTER MODELS PROVIDER
		{
			provide: MsSqlConstants.MASTER_CERTIFICATIONS_MODEL,
			useValue: TblCertifications
		},
		{
			provide: MsSqlConstants.MASTER_DESIGNATION_MODEL,
			useValue: TblDesignation
		},
		{
			provide: MsSqlConstants.MASTER_PROJECTS_MODEL,
			useValue: TblProjects
		},
		{
			provide: MsSqlConstants.MASTER_ROLES_MODEL,
			useValue: MasterRoles
		},
		{
			provide: MsSqlConstants.MASTER_SKILL_MODEL,
			useValue: TblSkills
		}
	],
	models: any = msSqlDBModelsProvider.map((providers) => providers.useValue);

export { msSqlDBModelsProvider, models };
