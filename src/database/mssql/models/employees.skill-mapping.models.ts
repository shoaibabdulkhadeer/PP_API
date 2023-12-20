import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql'; // Use the provided import path for Tables
import { Schema } from '../connection/schmeas.mssql';
import { TblBasicInfo } from './employees.basic-info.models';
import { TblSkills } from './master.skill.models';

@Table({
	tableName: Tables.Tbl_SkillMapping,
	schema: Schema.Employees,
	timestamps: false
})
export class TblSkillMapping extends Model<TblSkillMapping> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	SkillMappingGuId: string;

	// FK_Tbl_SkillMapping_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmployeeGuID: string;
	@BelongsTo(() => TblBasicInfo, {
		foreignKey: 'EmployeeGuID',
		as: 'employeeInfo'
	})
	EmployeeGuIDInfo: TblBasicInfo;

	// FK_Tbl_SkillMapping_Master_Tbl_Skills_SkillGuId
	@ForeignKey(() => TblSkills)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	SkillGuId: string;
	@BelongsTo(() => TblSkills, 'SkillGuId')
	SkillGuIdInfo: TblSkills;

	@Column({
		type: DataType.TINYINT,
		allowNull: true
	})
	SelfRating: number | null;

	@Column({
		type: DataType.TINYINT,
		allowNull: true
	})
	ReportingManagerRating: number | null;

	@Column({
		type: DataType.BIT,
		allowNull: false,
		defaultValue: 1
	})
	IsActive: boolean;

	// FK_Tbl_SkillMapping_CreatedBy_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, {
		foreignKey: 'CreatedBy',
		as: 'createdByInfo'
	})
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_SkillMapping_UpdatedBy_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo)
	updatedByInfo: TblBasicInfo | null;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;
}
