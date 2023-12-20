export class AppConfigService {
	private readonly envConfig: { [key: string]: any } = {};

	constructor() {
		// App configurations for "PORT" and "Environment"
		this.envConfig.app = {
			Performance_Api_Port: parseInt(process.env.APP_PORT, 10) || 4000,
			environment: process.env.ENVIRONMENT
		};

		// database
		this.envConfig.db = {
			mssql: {
				dialect: 'mssql',
				database: process.env.MSSQL_DATABASE,
				username: process.env.MSSQL_USERNAME,
				password: process.env.MSSQL_PASSWORD,
				host: process.env.MSSQL_SERVER,
				port: Number(process.env.MSSQL_PORT),
				trustServerCertificate: Boolean(process.env.MSSQL_TRUST_SERVER_CERTIFICATE)
			}
		};

		/*blob configurations*/
		this.envConfig.blobStorage = {
			blobAccountName: process.env.BLOB_AC_NAME,
			blobAccountKey: process.env.BLOB_AC_KEY,
			blobAccountConnectionString: process.env.BLOB_CONNECTION_STRING,
			blobLoggerContainer: process.env.BLOB_LOGGER_CONTAINER,
			blobCertificateContainer: process.env.BLOG_CERTIFICATE_CONTAINER,
			linkValidity: process.env.BLOB_LINK_LIVE_INMIN
		};

		// Logger Configurations
		this.envConfig.logger = {
			logLevel: process.env.LOG_LEVEL
		};

		this.envConfig.emailResponse = {
			senderMail: process.env.MAIL_SENDER_USERNAME,
			senderPassword: process.env.MAIL_SENDER,
			deployedWebsite: process.env.WEBSITE_lINK
		};

		/*Application secretes & token settings*/
		this.envConfig.tokenMetadata = {
			appAtSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
			web: {
				at: {
					expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_TIMEMIN
				},
				rt: {
					expiresIn: process.env.JWT_ACCESS_TOKEN_EXP_TIMEMIN
				}
			}
		};

		this.envConfig.authsso = {
			aad: {
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET
			}
		};
	}

	get(key: string): any {
		return this.envConfig[key];
	}
}
