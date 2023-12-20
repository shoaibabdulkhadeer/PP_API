import { AppResponse } from '@app/shared/appresponse.shared';

export abstract class AbstractMasterSvc {
	abstract getDepartmentSvc(): Promise<AppResponse>;
	abstract getDesignationSvc(): Promise<AppResponse>;
	abstract getUsersRoleRmSvc(): Promise<AppResponse>;
	abstract getAdditonalRolesSvc(): Promise<AppResponse>;
	abstract getAllSkillsSvc(): Promise<AppResponse>;
	abstract getAllCertificatesSvc(): Promise<AppResponse>;
}
