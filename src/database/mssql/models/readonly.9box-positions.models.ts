import { DataType } from '@app/core/enums/data-type.enum';
import { Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql'; // Use the provided import path for Tables
import { Schema } from '../connection/schmeas.mssql'; // Use the provided import path for Schema
import { TblSkillMapping } from './employees.skill-mapping.models';
import { TblMonthlyPerformanceInfo } from './employees.monthly-performance-info.models';

@Table({
	tableName: Tables.Tbl_9BoxPositions,
	schema: Schema.Readonly,
	timestamps: false
})
export class Tbl9BoxPositions extends Model<Tbl9BoxPositions> {
	@PrimaryKey
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	PositionId: number;

	@Column({
		type: `${DataType.VARCHAR}(50)`,
		allowNull: false
	})
	BoxName: string;

	@Column({
		type: `${DataType.VARCHAR}(50)`,
		allowNull: false
	})
	BoxDescription: string;

	@Column({
		type: DataType.BIT,
		allowNull: false
	})
	IsActive: boolean;

	@HasMany(() => TblMonthlyPerformanceInfo, { foreignKey: 'PositionId', as: 'positionAssociation' })
	monthlyPosition: TblMonthlyPerformanceInfo[];
}
