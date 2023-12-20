export enum RoleType {
	ADMIN = 'Admin',
	REPORTING_MANAGER = 'Reporting Manager',
	EMPLOYEE = 'Employee'
}

export class RoleGroup {
	static readonly ADMIN: RoleType[] = [RoleType.ADMIN];
	static readonly REPORTING_MANAGER: RoleType[] = [RoleType.REPORTING_MANAGER];
	static readonly RM_ADMIN: RoleType[] = [RoleType.REPORTING_MANAGER, RoleType.ADMIN];
	static readonly EMPLOYEE: RoleType[] = [RoleType.EMPLOYEE];
	static readonly RM_ADMIN_EMP: RoleType[] = [RoleType.REPORTING_MANAGER, RoleType.ADMIN, RoleType.EMPLOYEE];
}
