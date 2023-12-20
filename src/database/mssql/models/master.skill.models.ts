import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID, HasMany } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql'; // Use the provided import path for Tables
import { Schema } from '../connection/schmeas.mssql'; // Use the provided import path for Schema
import { TblSkillTags } from './readonly.skill-tags.models';
import { TblBasicInfo } from './employees.basic-info.models';
import { TblSkillMapping } from './employees.skill-mapping.models';

@Table({
	tableName: Tables.Tbl_Skills,
	schema: Schema.Masters,
	timestamps: false
})
export class TblSkills extends Model<TblSkills> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	SkillGuId: string;

	@Column({
		type: `${DataType.VARCHAR}(100)`,
		allowNull: false
	})
	SkillName: string;

	@Column({
		type: `${DataType.VARCHAR}(500)`,
		allowNull: true
	})
	SkillDescription: string | null;

	// FK_Tbl_Skills_Tbl_SkillTags_SkillTagId
	@ForeignKey(() => TblSkillTags)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	SkillTagId: number;
	@BelongsTo(() => TblSkillTags, 'SkillTagId')
	SkillTagIdInfo: TblSkillTags;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;

	// FK_Tbl_Skills_Tbl_BasicInfo_CreatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false,
		field: 'CreatedBy'
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, { foreignKey: 'CreatedBy', as: 'createdByInfo' })
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_Skills_Tbl_BasicInfo_UpdatedBy
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true,
		field: 'UpdatedBy'
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo, 'UpdatedBy')
	UpdatedByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;

	// @HasMany(() => TblSkillMapping, 'SkillGuId') // 'SkillGuId' should be the foreign key in TblSkillMapping
	// skillMappings: TblSkillMapping[];
}
