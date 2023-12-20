import { AppResponse } from '@app/shared/appresponse.shared';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractDashBoardSvc {
	abstract getemployeesratingSvc(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract geteEmployeesBillableNonbillable(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<AppResponse>;
	abstract geteEmployees9BoxData(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesMaxBillableHours(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithoutProjectsSvc(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithAllocatedHoursLessThan8Svc(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithAllocatedHoursgreaterThan8Svc(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract findEmployeeByIdSvc(employeeId: string, claims: JwtToken): Promise<AppResponse>;
}
