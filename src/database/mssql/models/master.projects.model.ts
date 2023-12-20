import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID, HasMany } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblBasicInfo } from './employees.basic-info.models';
import { TblProjectMapping } from './employees.project-mapping.models';

@Table({
	tableName: Tables.Tbl_Projects,
	schema: Schema.Masters,
	timestamps: false
})
export class TblProjects extends Model<TblProjects> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	ProjectGuId: string;

	@Column({
		type: `${DataType.VARCHAR}(100)`,
		allowNull: false
	})
	ProjectName: string;

	@Column({
		type: `${DataType.VARCHAR}(500)`,
		allowNull: true
	})
	ProjectDescription: string | null;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;

	@Column({
		type: DataType.DATE,
		allowNull: false
	})
	StartDate: string;

	@Column({
		type: DataType.DATE,
		allowNull: false
	})
	EndDate: string;

	// FK_Tbl_Projects_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, { foreignKey: 'CreatedBy', as: 'createdByInfo' })
	createdByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_Projects__UpdatedBy_Tbl_BasicInfo_EmployeeGuID
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

	@HasMany(() => TblProjectMapping, 'ProjectGuID')
	TblProjectMappings: TblProjectMapping[];
}
