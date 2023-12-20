import { JwtToken } from '@app/modules/auth/models/jwt_token.model';
import { AppResponse } from '@app/shared/appresponse.shared';
import { EditMonthlyPerformanceInfo, MonthlyPerformanceInfo, UpdateMonthlyPerformanceInfo } from '@app/shared/models.shared';

export abstract class AbstractEmpReportSqlDao {
	abstract getAllEmpReport(claims: JwtToken): Promise<AppResponse>;
	abstract editEmpReport(editData: UpdateMonthlyPerformanceInfo, claims: JwtToken): Promise<AppResponse>;
	abstract addNewEmpMonthReport(addingNewReport: any): Promise<AppResponse>;
	abstract getEmpNames(claims: JwtToken): Promise<AppResponse>;
	abstract get9boxModel(): Promise<AppResponse>;
	abstract exportMonthReport(data: any, claims: JwtToken): Promise<AppResponse>;
}
