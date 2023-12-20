import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractMaster {
	abstract getDepartmentsDao(): Promise<AppResponse>;
	abstract getDesignationDao(): Promise<AppResponse>;
	abstract getUserRoleRmDao(): Promise<AppResponse>;
	abstract getAdditionalRolesDao(): Promise<AppResponse>;
	abstract getallskillsDao(): Promise<AppResponse>;
	abstract getallCertificatesDao(): Promise<AppResponse>;
}
