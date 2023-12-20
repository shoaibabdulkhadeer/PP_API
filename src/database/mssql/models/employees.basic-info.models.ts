import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, IsUUID, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblDesignation } from './master.designation.models';
import { TblDepartment } from './readonly.department.models';
import { TblProjectMapping } from './employees.project-mapping.models';
import { TblSkillMapping } from './employees.skill-mapping.models';
import { TblCertificationMapping } from './employees.certification-mapping.models';
import { TblAppSessions } from './logs.app-sessions.models';
import { EmployeesTblRoles } from './employees.roles.models';
import { TblMonthlyPerformanceInfo } from './employees.monthly-performance-info.models';
import { TblCertifications } from './masters.certifications.models';
import { TblSkills } from './master.skill.models';
import { TblProjects } from './master.projects.model';

@Table({
	tableName: Tables.Tbl_BasicInfo,
	schema: Schema.Employees,
	timestamps: false
})
export class TblBasicInfo extends Model<TblBasicInfo> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmployeeGuID: string;

	@Column({
		type: `${DataType.VARCHAR}(100)`,
		allowNull: false
	})
	FullName: string;

	@Column({
		type: `${DataType.VARCHAR}(150)`,
		allowNull: false
	})
	Username: string;

	@Column({
		type: `${DataType.VARCHAR}(150)`,
		allowNull: false
	})
	Password: string;

	@Column({
		type: `${DataType.VARCHAR}(150)`,
		allowNull: false
	})
	CommunicationEmailAddress: string;

	@Column({
		type: `${DataType.VARCHAR}(20)`,
		allowNull: false
	})
	EmployeeID: string;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	JoiningDate: number;

	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	TotalYearsOfExperience: number;

	// FK_Tbl_BasicInfo_Tbl_Designation_DesignationId
	@ForeignKey(() => TblDesignation)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	DesignationId: number;
	// Association to designation table
	@BelongsTo(() => TblDesignation, 'DesignationId')
	designation: TblDesignation;

	// FK_Tbl_BasicInfo_Tbl_Department_DepartmentId
	@ForeignKey(() => TblDepartment)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	DepartmentId: number;
	// Association to department table
	@BelongsTo(() => TblDepartment, 'DepartmentId')
	department: TblDepartment;

	// @ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true
	})
	ReportingManagerEmployeeGuID: string | null;
	@BelongsTo(() => TblBasicInfo, { foreignKey: 'ReportingManagerEmployeeGuID', as: 'reportingManager' })
	reportingManager: TblBasicInfo;

	@Column({
		type: `${DataType.DECIMAL}(18, 2)`,
		allowNull: false
	})
	HourlyCost: number;

	@Column({
		type: DataType.BIT,
		allowNull: false,
		defaultValue: 1
	})
	IsActive: boolean;

	// // FK_Tbl_BasicInfo_Tbl_BasicInfo_CreatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, 'CreatedBy')
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_BasicInfo_Tbl_BasicInfo_UpdatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo, 'UpdatedBy')
	updatedByInfo: TblBasicInfo | null;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;

	@HasMany(() => TblProjectMapping, 'EmployeeGuID')
	projectMappings: TblProjectMapping[];

	@HasMany(() => TblSkillMapping, 'EmployeeGuID')
	skillsMappings: TblSkillMapping[];

	@HasMany(() => TblCertificationMapping, 'EmployeeGuID')
	certificationMappings: TblCertificationMapping[];

	@HasMany(() => EmployeesTblRoles, 'EmployeeGuID')
	empRoleMappings: EmployeesTblRoles[];

	@HasMany(() => TblAppSessions, 'EmployeeGuID')
	sessionsMappings: TblAppSessions[];

	@HasMany(() => TblMonthlyPerformanceInfo, 'EmployeeGuID')
	monthlyperMappings: TblMonthlyPerformanceInfo[];

	@HasMany(() => TblCertifications, 'CreatedBy')
	certificationsCreated: TblCertifications[];

	@HasMany(() => TblSkills, 'CreatedBy')
	skillCreated: TblSkills[];

	@HasMany(() => TblProjects, 'CreatedBy')
	projectCreated: TblProjects[];
}
