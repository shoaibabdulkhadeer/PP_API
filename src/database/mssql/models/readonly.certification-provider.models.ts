import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql'; // Use the provided import path for Tables
import { Schema } from '../connection/schmeas.mssql'; // Use the provided import path for Schema

@Table({
	tableName: Tables.Tbl_CertificationProvider,
	schema: Schema.Readonly,
	timestamps: false
})
export class TblCertificationProvider extends Model<TblCertificationProvider> {
	@PrimaryKey
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	CertificationProviderId: number;

	@Column({
		type: `${DataType.VARCHAR}(50)`,
		allowNull: false
	})
	CertificationProviderName: string;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;
}
