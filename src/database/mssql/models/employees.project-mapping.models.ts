import { DataType } from '@app/core/enums/data-type.enum';

import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';

import { Tables } from '../connection/tables.mssql';

import { Schema } from '../connection/schmeas.mssql';

import { TblBasicInfo } from './employees.basic-info.models';

import { TblProjects } from './master.projects.model';

@Table({
	tableName: Tables.Tbl_ProjectMapping,

	schema: Schema.Employees,

	timestamps: false
})
export class TblProjectMapping extends Model<TblProjectMapping> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	EmployeesProjectMappingGuId: string;

	// FK_Tbl_ProjectMapping_Tbl_BasicInfo_EmployeeGuID

	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	EmployeeGuID: string;

	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	EmployeeGuIDInfo: TblBasicInfo;

	// FK_Tbl_ProjectMapping_Tbl_Projects_ProjectGuId

	@ForeignKey(() => TblProjects)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	ProjectGuId: string;

	@BelongsTo(() => TblProjects, 'ProjectGuId')
	ProjectGuIdInfo: TblProjects;

	@Column({
		type: DataType.TINYINT,

		allowNull: false
	})
	DailyAllocatedHours: number;

	// FK_Tbl_ProjectMapping_CreatedBy_Tbl_BasicInfo_EmployeeGuID

	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: false
	})
	CreatedBy: string;

	@BelongsTo(() => TblBasicInfo, 'CreatedBy')
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIT,

		allowNull: false,

		defaultValue: 1
	})
	IsActive: boolean;

	@Column({
		type: DataType.BIGINT,

		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_ProjectMapping_UpdatedBy_Tbl_BasicInfo_EmployeeGuID

	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,

		allowNull: true
	})
	UpdatedBy: string | null;

	@BelongsTo(() => TblBasicInfo, 'UpdatedBy')
	updatedByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,

		allowNull: true
	})
	UpdatedAt: number | null;
}
