import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblBasicInfo } from './employees.basic-info.models';
import { TblCertifications } from './masters.certifications.models';

@Table({
	tableName: Tables.Tbl_CertificationMapping, // Use the Tables enum
	schema: Schema.Employees, // Use the Schema enum
	timestamps: false
})
export class TblCertificationMapping extends Model<TblCertificationMapping> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CertificationMappingGuId: string;

	// FK_Tbl_CertificationMapping_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmployeeGuID: string;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	EmployeeGuIDInfo: TblBasicInfo;

	//FK_Tbl_CertificationMapping_Master_Tbl_Certifications_CertificationGuId
	@ForeignKey(() => TblCertifications)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CertificationGuId: string;
	@BelongsTo(() => TblCertifications, 'CertificationGuId')
	CertificationGuIdInfo: TblCertifications;

	@Column({
		type: `${DataType.VARCHAR}(200)`,
		allowNull: false
	})
	CertificationFileNameWithExtension: string;

	// FK_Tbl_CertificationMapping_CreatedBy_Tbl_BasicInfo_EmployeeGuID
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

	// FK_Tbl_CertificationMapping_UpdatedBy_Tbl_BasicInfo_EmployeeGuID
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
