import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblBasicInfo } from './employees.basic-info.models';
import { MasterRoles } from './master.roles.models';

@Table({
	tableName: Tables.Tbl_AppSessions,
	schema: Schema.Logs,
	timestamps: false
})
export class TblAppSessions extends Model<TblAppSessions> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	AppSessionGuID: string;

	// FK_Tbl_AppSessions_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmployeeGuID: string;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	EmployeeGuIDInfo: TblBasicInfo;

	// FK_Tbl_Roles_Tbl_AppSessions_RoleID
	@ForeignKey(() => MasterRoles)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	RoleID: number;
	@BelongsTo(() => MasterRoles)
	MasterRoleId: MasterRoles;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	StartedAt: number;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	EndsAt: number;

	// FK_Tbl_AppSessions_Tbl_BasicInfo_CreatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_AppSessions_Tbl_BasicInfo_UpdatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	updatedByInfo: TblBasicInfo | null;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;
}
