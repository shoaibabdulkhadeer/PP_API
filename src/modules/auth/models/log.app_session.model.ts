export interface AppSessionModel {
	AppSessionGuID: string;
	EmployeeGuID: string;
	RoleID: number;
	StartedAt: number;
	EndsAt: number;
	CreatedBy: string;
	CreatedAt?: number;
	UpdatedBy?: string;
	UpdatedAt?: number;
}
