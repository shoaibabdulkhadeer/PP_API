export enum Tables {
	//#region EMPLOYEES TABLES
	Tbl_BasicInfo = 'Tbl_BasicInfo',
	Tbl_CertificationMapping = 'Tbl_CertificationMapping',
	Tbl_MonthlyPerformanceInfo = 'Tbl_MonthlyPerformanceInfo',
	Tbl_ProjectMapping = 'Tbl_ProjectMapping',
	EMPLOYEE_Tbl_Roles = 'Tbl_Roles',
	Tbl_SkillMapping = 'Tbl_SkillMapping',
	//#endregion

	//#region LOGS TABLES
	Tbl_AppSessions = 'Tbl_AppSessions',
	Tbl_EmailLogsMaster = 'Tbl_EmailLogsMaster',
	//#endregion

	//#region MASTER TABLES
	Tbl_Certifications = 'Tbl_Certifications',
	Tbl_Designation = 'Tbl_Designation',
	Tbl_Projects = 'Tbl_Projects',
	MASTER_Tbl_Roles = 'Tbl_Roles',
	Tbl_Skills = 'Tbl_Skills',
	//#endregion

	//#region READONLY TABLES
	Tbl_9BoxPositions = 'Tbl_9BoxPositions',
	Tbl_CertificationProvider = 'Tbl_CertificationProvider',
	Tbl_Department = 'Tbl_Department',
	Tbl_SkillTags = 'Tbl_SkillTags'
	//#endregion
}

export class TableGroup {
	public static readonly TABLES: Tables[] = [
		Tables.Tbl_BasicInfo,
		Tables.Tbl_CertificationMapping,
		Tables.Tbl_MonthlyPerformanceInfo,
		Tables.Tbl_ProjectMapping,
		Tables.EMPLOYEE_Tbl_Roles,
		Tables.Tbl_SkillMapping,
		Tables.Tbl_AppSessions,
		Tables.Tbl_EmailLogsMaster,
		Tables.Tbl_Certifications,
		Tables.Tbl_Designation,
		Tables.Tbl_Projects,
		Tables.MASTER_Tbl_Roles,
		Tables.Tbl_Skills,
		Tables.Tbl_9BoxPositions,
		Tables.Tbl_CertificationProvider,
		Tables.Tbl_Department,
		Tables.Tbl_SkillTags
	];
}
