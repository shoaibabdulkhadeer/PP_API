import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql'; // Use the provided import path for Tables
import { Schema } from '../connection/schmeas.mssql'; // Use the provided import path for Schema

@Table({
	tableName: Tables.Tbl_Designation,
	schema: Schema.Masters,
	timestamps: false
})
export class TblDesignation extends Model<TblDesignation> {
	@PrimaryKey
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	DesignationId: number;

	@Column({
		type: `${DataType.VARCHAR}(100)`,
		allowNull: false
	})
	DesignationName: string;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;
}
