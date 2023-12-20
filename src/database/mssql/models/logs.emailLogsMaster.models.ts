import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { DataType } from '@app/core/enums/data-type.enum';

@Table({
	tableName: Tables.Tbl_EmailLogsMaster,
	schema: Schema.Logs,
	timestamps: false
})
export class Tbl_EmailLogsMaster extends Model<Tbl_EmailLogsMaster> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmailLogsMasterGuid: string;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	EmailLoggedDateTime: number;

	@Column({
		type: `${DataType.VARCHAR}(1000)`,
		allowNull: false
	})
	EmailToComma: string;

	@Column({
		type: `${DataType.VARCHAR}(1000)`,
		allowNull: true
	})
	EmailCcComma: string;

	@Column({
		type: `${DataType.VARCHAR}(1000)`,
		allowNull: true
	})
	EmailBccComma: string;

	@Column({
		type: `${DataType.VARCHAR}(1000)`,
		allowNull: false
	})
	EmailSubject: string;

	@Column({
		type: DataType.TEXT,
		allowNull: false
	})
	EmailBody: string;
}
