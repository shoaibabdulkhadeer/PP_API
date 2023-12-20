import { AppResponse } from '@app/shared/appresponse.shared';
import { AddNewReportDto } from './dto/monthlyEmployeeReport.dto';
import { EditMonthlyPerformanceInfo, MonthlyPerformanceInfo, UpdateMonthlyPerformanceInfo } from '@app/shared/models.shared';
import { JwtToken } from '../auth/models/jwt_token.model';

export abstract class AbstractEmpReportSvc {
	abstract getAllEmpReportSvc(claims: JwtToken): Promise<AppResponse>;
	abstract editEmpReportSvc(addingNewReport: UpdateMonthlyPerformanceInfo, claims: JwtToken): Promise<AppResponse>;
	abstract addNewEmpMonthReportSvc(addingNewReport: any, claims: JwtToken): Promise<AppResponse>;
	abstract getEmpNamesSvc(claims: JwtToken): Promise<AppResponse>;
	abstract get9boxModelSvc(): Promise<AppResponse>;
	abstract exportMonthReportSvc(date: any, claims: JwtToken): Promise<AppResponse>;
}
