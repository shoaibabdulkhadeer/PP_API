import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle('EMPLOYEE PERFORMANCE NEST APP')
		.setDescription('A NESTJS App for performing CRUD Operations on an SQL Server database using Sequelize.')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	// CSS For removing Curl command section
	const options = {
		customCss: `
        .response-col_description > div:nth-child(2) {
          display: none;
        }
      `
	};
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, document, options);
}
