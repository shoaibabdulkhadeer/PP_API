export interface MonthlyPerformanceInfo {
	MonthlyPerformanceInfoGuId?: string;
	ForMonth: Date;
	BillableHours: number;
	NonBillableHours: number;
	PositionId: nineBoxEnum; //9Box
	Remarks: string;
	CreatedBy: string; //RM Id
	CreatedAt?: number;
	UpdatedBy?: string;
	UpdatedAt?: number;
}
export interface EditMonthlyPerformanceInfo {
	ForMonth: Date;
	BillableHours: number;
	NonBillableHours: number;
	PositionId: nineBoxEnum; //9Box
	Remarks: string;
	CreatedBy?: string; //RM Id
	CreatedAt?: number;
	UpdatedBy?: string;
	UpdatedAt?: number;
}

export enum nineBoxEnum {
	'Consistent Star',
	'Rising Star',
	'High Performance',
	'Future Star',
	'Goal Achiever',
	'Solid Performance',
	'Trainable Trainee',
	'Inconsistent Achiever',
	'At Risk Professional'
}

export interface UpdateMonthlyPerformanceInfo {
	MonthlyPerformanceInfoGuId: string;
	ForMonth?: Date;
	BillableHours?: number;
	NonBillableHours?: number;
	PositionId?: nineBoxEnum; //9Box
	Remarks?: string;
	CreatedBy?: string; //RM Id
	CreatedAt?: number;
	UpdatedBy?: string;
	UpdatedAt?: number;
}
