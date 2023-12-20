class CommonRegExp {
	public static readonly NAME_REGEXP = /^[A-Za-z]+[A-Za-z\s]{0,202}$/;
	public static readonly EMAIL_REGEXP = /^[a-zA-Z][a-zA-Z0-9._\-]*@\w+\.\w+$/;
	public static readonly PHONE_REGEXP = /^[1-9][0-9]{5,11}$/;
	public static readonly DATE_REGEXP = /^\d{4}[-](0?[1-9]|1[0-2])[-](0?[1-9]|[1-2][0-9]|3[01])$/;
	public static readonly MONTH_YEAR_REGEXP = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/;
	public static readonly URL_REGEXP = /^(http:\/\/|https:\/\/|www\.).+/;
	public static readonly STRING_WITHOUT_SPECIAL_CHAR = /^[a-zA-Z ]+$/;
	public static readonly COUNTRY_CODE = /^\+\d{1,4}$/;
	public static readonly UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
	public static readonly G7CR_EMAIL_REGEX = /^[a-zA-Z0-9._-]+@(g7cr\.com|g7cr\.in)$/;
	public static readonly MONTH_REGEX = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/;
	public static readonly CERTIFICATION_FILENAME_EXTENSION_REGEX = /^(?=.+\.pdf$).{2,}$/;
}

export { CommonRegExp };
