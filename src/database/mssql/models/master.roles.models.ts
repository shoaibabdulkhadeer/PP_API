import { DataType } from '@app/core/enums/data-type.enum';
import { Column, Default, HasMany, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Schema } from '../connection/schmeas.mssql';

import { Tables } from '../connection/tables.mssql';
import { EmployeesTblRoles } from './employees.roles.models';
import { TblAppSessions } from './logs.app-sessions.models';

@Table({
	tableName: Tables.MASTER_Tbl_Roles,

	schema: Schema.Masters,

	timestamps: false
})
export class MasterRoles extends Model<MasterRoles> {
	@PrimaryKey
	@Column({ type: DataType.TINYINT, allowNull: false })
	RoleId: number;

	@Column({ type: `${DataType.VARCHAR}(20)`, allowNull: false })
	RoleName: string;

	@Column({ type: DataType.BIT, allowNull: false })
	IsActive: boolean;
}
