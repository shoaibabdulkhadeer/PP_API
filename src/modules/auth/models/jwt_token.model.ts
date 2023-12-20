export interface JwtToken {
	appSessionId: string;
	readonly EmployeeGuID: string;
	readonly DepartmentId: number;
	readonly Username: string;
	readonly FullName: string;
	readonly RoleName: string;
}
