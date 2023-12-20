export enum Schema {
	Masters = 'Masters',
	Readonly = 'Readonly',
	Employees = 'Employees',
	Logs = 'Logs'
}

export class SchemaGrp {
	static readonly ALL_SCHEMAS: Schema[] = [Schema.Masters, Schema.Readonly];
}
