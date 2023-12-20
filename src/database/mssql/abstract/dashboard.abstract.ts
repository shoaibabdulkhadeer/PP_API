import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractDashBoardSqlDao {
	abstract getEmployeesbyRating(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesbyWorkingHours(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesby9b0xdata(DepartmentId: number, month: number, year: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesMaxBillableHours(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithoutProjects(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithAllocatedHoursLessThan8(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract getEmployeesWithAllocatedHoursgreaterThan8(DepartmentId: number, claims: JwtToken): Promise<AppResponse>;
	abstract findEmployeeById(employeeId: string, claims: JwtToken): Promise<AppResponse>;
}
