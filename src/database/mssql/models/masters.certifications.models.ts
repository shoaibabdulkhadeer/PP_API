import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID, HasMany } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblCertificationProvider } from './readonly.certification-provider.models';
import { TblBasicInfo } from './employees.basic-info.models';
import { TblCertificationMapping } from './employees.certification-mapping.models';

@Table({
	tableName: Tables.Tbl_Certifications,
	schema: Schema.Masters,
	timestamps: false
})
export class TblCertifications extends Model<TblCertifications> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CertificationGuId: string;

	@Column({
		type: `${DataType.VARCHAR}(100)`,
		allowNull: false
	})
	CertificationName: string;

	@Column({
		type: `${DataType.VARCHAR}(500)`,
		allowNull: true
	})
	CertificationDescription: string | null;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;

	// FK_Tbl_Certifications_Tbl_CertificationProvider_CertificationProviderId
	@ForeignKey(() => TblCertificationProvider)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	CertificationProviderId: number;
	@BelongsTo(() => TblCertificationProvider, 'CertificationProviderId')
	CertificationProviderIdInfo: TblCertificationProvider;

	// FK_Tbl_Certifications_CreatedBy_Tbl_BasicInfo_EmployeeGuID
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

	// FK_Tbl_Certifications_UpdatedBy_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true,
		field: 'UpdatedBy'
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo)
	updatedByInfo: TblBasicInfo | null;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;

	// @HasMany(() => TblCertificationMapping, 'CertificationGuId') // 'SkillGuId' should be the foreign key in TblSkillMapping
	// certificationMappings: TblCertificationMapping[];
}
