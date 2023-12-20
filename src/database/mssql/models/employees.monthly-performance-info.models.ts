import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Model, PrimaryKey, Table, Default, ForeignKey, BelongsTo, IsUUID } from 'sequelize-typescript';
import { Tables } from '../connection/tables.mssql';
import { Schema } from '../connection/schmeas.mssql';
import { TblBasicInfo } from './employees.basic-info.models';
import { Tbl9BoxPositions } from './readonly.9box-positions.models';

@Table({
	tableName: Tables.Tbl_MonthlyPerformanceInfo, // Use the Tables enum
	schema: Schema.Employees, // Use the Schema enum
	timestamps: false
})
export class TblMonthlyPerformanceInfo extends Model<TblMonthlyPerformanceInfo> {
	@PrimaryKey
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	MonthlyPerformanceInfoGuId: string;

	@Column({
		type: DataType.DATE,
		allowNull: false
	})
	ForMonth: Date;

	// FK_Tbl_MonthlyPerformanceInfo_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	EmployeeGuID: string;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	EmployeeGuIDInfo: TblBasicInfo;

	@Column({
		type: DataType.SMALLINT,
		allowNull: false
	})
	BillableHours: number;

	@Column({
		type: DataType.SMALLINT,
		allowNull: false
	})
	NonBillableHours: number;

	// FK_Tbl_MonthlyPerformanceInfo_Tbl_9BoxPositions_PositionId
	@ForeignKey(() => Tbl9BoxPositions)
	@Column({
		type: DataType.TINYINT,
		allowNull: false
	})
	PositionId: number;
	@BelongsTo(() => Tbl9BoxPositions, 'PositionId')
	PositionIdInfo: Tbl9BoxPositions;

	// FK_Tbl_MonthlyPerformanceInfo_CreatedBy_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: false
	})
	CreatedBy: string;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	creaatedByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: false
	})
	CreatedAt: number;

	// FK_Tbl_MonthlyPerformanceInfo_UpdatedBy_Tbl_BasicInfo_EmployeeGuID
	@ForeignKey(() => TblBasicInfo)
	@Column({
		type: DataType.UNIQUEIDENTIFIER,
		allowNull: true
	})
	UpdatedBy: string | null;
	@BelongsTo(() => TblBasicInfo, 'EmployeeGuID')
	updatedByInfo: TblBasicInfo;

	@Column({
		type: DataType.BIGINT,
		allowNull: true
	})
	UpdatedAt: number | null;

	@Column({
		type: `${DataType.VARCHAR}(500)`,
		allowNull: false
	})
	Remarks: string;
}
