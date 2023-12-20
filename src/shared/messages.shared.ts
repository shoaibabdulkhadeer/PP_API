export function messageFactory(message: string, msgParams?: string[]): string {
	let newMsg = message;

	if (msgParams && msgParams.length > 0) {
		msgParams.forEach((val, key) => {
			newMsg = newMsg.split(`ARG${key}`).join(val?.toString());
		});
	}

	return newMsg;
}

export const enum messages {
	// SERVER Messages

	S1 = 'Performance-Pulse_API App is listening on ARG0',

	S2 = 'Performance Pulse API App  service is up and running changed',

	S3 = 'Connected to SQL server!',

	S4 = 'Success',

	// Profile Employee API messages

	S5 = 'No Employee found with requested EmployeeGuid.',

	S6 = 'Employee with given EmployeeID fetched Successfully.',

	S7 = 'No Projects available for given Employee ID.',

	S8 = 'Projects for given Employee ID fetched successfully.',

	S9 = 'No Skill found for given Employee ID',

	S10 = 'Skills for given Employee ID fetched successfully.',

	S11 = 'Skill Rating for given Employee ID updated successfully.',

	S12 = 'No Certifications available for given Employee ID.',

	S13 = 'Certifications for given Employee ID fetched successfully.',

	S14 = 'Certifications successfully added for the Employee.',

	S15 = 'No Monthly report found for given Employee ID.',

	S16 = 'Monthly report data for given Employee ID fetched successfully.',

	//Projects and Skills API's messages

	S17 = 'Projects fetched successfully',

	S18 = 'Project created successfully',

	S19 = 'Project updated successfully',

	S20 = 'Project disabled successfully',

	S21 = 'All skills fetched successfully',

	S22 = 'Skill added successfully',

	S23 = 'Skill updated successfully',

	S24 = 'Skill disabled successfully',

	S25 = 'Skill activated successfully',

	S26 = 'All skills tags fetched successfully',

	S27 = 'Employee information updated successfully',

	S28 = 'Employee status updated successfully',

	S29 = 'Employee fetched Successfully',

	S30 = 'Departments Fetched Successfully',

	S31 = 'Average rating of each employee fetched successfully',

	S32 = '9-box employees data fetched successfully',

	S33 = 'On Bench Employees',

	S34 = 'Employee data registered successfully',

	S35 = 'Additional roles fetched successfully',

	S36 = 'Designation fetched successfully',

	S37 = 'Reporting Managers fetched successfully',

	S38 = 'No Certifications available.',

	S39 = 'All Certifications fetched successfully.',

	S40 = 'Employee updated successfully',

	S41 = 'Skill mapping deactivated successfully.',

	S42 = 'Skill successfully mapped to the employee',

	S43 = 'Reporting manager rating successfully updated',

	S44 = 'Successfully 9-BOX MODEL DATA FETCHED',

	S45 = 'Successfully fetched all Employee Report',

	S46 = 'Successfully add new employee month report',

	S47 = 'Successfully employee names fetched',

	S48 = 'Successfully edited employee report',

	S49 = 'Working Hours Fetched Successfully',

	S50 = 'Last 3 months billable and non-billable hours fetched successfully',

	S51 = 'Switched roles successfully',

	S52 = 'Default Role changed successfully',

	// WARNING

	W1 = 'You are not authorized to access this application',

	W2 = 'Invalid Password',

	W3 = 'ARG0 should not be empty!',

	W4 = 'Please provide a valid ARG0!',

	W5 = 'Please provide atlest one field',

	W6 = 'Skill mapping is already deactivated.',

	W7 = 'Certificate name already exists',

	W8 = 'Employee name not found',

	W9 = 'Project not found for Id',

	W10 = 'Project is already disabled',

	W11 = 'Skill is already disabled',

	W12 = 'Skill Not Found',

	W13 = 'SkillTagId Not found',

	W14 = 'Project name already exists',

	W15 = 'PageSize is not a valid integer',

	W16 = 'Skill name already exists',

	W17 = 'Email already exists',

	W18 = 'Username already exists',

	W19 = 'Error while fetching data',

	W20 = 'Employee not found',

	W21 = 'No employees with allocated hours less than or equal to 8 hours found',

	W22 = 'No employees with allocated hours greater than 8 hours found',

	W23 = 'No employees found without project',

	W24 = 'EmployeeId already exists',

	W25 = 'Skill SelfRating, and SkillGuId are required fields.',

	W26 = 'ERROR WHILE FETCHING all Employee Report',

	W27 = 'ERROR WHILE Edit Employee Report',

	W28 = 'ERROR WHILE AddING New Employee Month Report',

	W29 = 'ERROR WHILE FETCHING Employee Names',

	W30 = 'ERROR WHILE FETCHING 9Box Model!',

	W31 = 'No Data!',

	W32 = 'ERROR WHILE FETCHING Monthly Report',

	W33 = 'Employee Id is not there',

	W34 = 'Invalid Certification ID',

	W35 = 'EndDate Must be greater than startdate',

	W36 = 'Employee name has already been added to this project',

	W37 = 'Error while getting certificate from Blob',

	W38 = 'The Certification does not exist for given Employee GuId',

	W39 = 'The Certification file does not exist in Blob',

	W40 = 'The Certification already exist from given EmployeeID.',

	W41 = 'No Skill Record',

	W42 = 'Reporting Manager Id Invalid',

	W43 = ' Empty Reports!',

	W44 = 'This month report is already submitted',

	W45 = "Employee's maximum allocation hours exceeded.",

	W46 = 'EmployeeGuId is mandotory in Project fetching Body for Admin and Reporting Manager Role.',

	W47 = 'EmployeeGuId should not exist in Project fetching Body for Employee Role.',

	W48 = 'Invalid Google ID Token',

	W49 = 'User not found for the provided email',

	//Error messages : Start with En

	E1 = 'Performance-Pulse API App failed to start!',

	E2 = 'Oops! An error occurred while processing your request',

	E3 = 'Unauthorized request!',

	E4 = 'An error occurred while establishing connection to SQL server! (ERROR :: ARG0)',

	E5 = 'SQL database connection disconnected through app termination!',

	E6 = 'Error closing SQL database connection! (ERROR :: ARG0)!',

	E7 = 'Oops! An error occurred while fetching projects',

	E8 = 'Error validating Google ID Token. Unexpected status code'
}
