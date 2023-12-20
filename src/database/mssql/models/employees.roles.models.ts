import { DataType } from '@app/core/enums/data-type.enum';

import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';

import { Tables } from '../connection/tables.mssql';

import { Schema } from '../connection/schmeas.mssql';

import { TblBasicInfo } from './employees.basic-info.models';

import { MasterRoles } from './master.roles.models';

@Table({
	tableName: Tables.EMPLOYEE_Tbl_Roles,

	schema: Schema.Employees,

	timestamps: false
})
export class EmployeesTblRoles extends Model<EmployeesTblRoles> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	EmployeeRoleGuID: string;

	// FK_Tbl_Roles_Tbl_BasicInfo_EmployeeGuID

	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	EmployeeGuID: string;

	@BelongsTo(() => TblBasicInfo)
	EmployeeGuIDInfo: TblBasicInfo;

	// FK_Tbl_Roles_Master_Tbl_Roles_RoleId

	@ForeignKey(() => MasterRoles)
	@Column({
		type: DataType.TINYINT,

		allowNull: false
	})
	RoleID: number;
	@BelongsTo(() => MasterRoles)
	MasterRoleId: MasterRoles;

	@Column({
		type: DataType.BIT,

		allowNull: false
	})
	IsDefault: boolean;

	@Column({
		type: DataType.BIGINT,

		allowNull: false
	})
	EffectiveFrom: number;

	@Column({
		type: DataType.BIGINT,

		allowNull: false
	})
	EffectiveTill: number;

	// FK_Tbl_Roles_CreatedBy_Tbl_BasicInfo_EmployeeGuID

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

	// FK_Tbl_Roles_UpdatedBy_Tbl_BasicInfo_EmployeeGuID

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
}
