import { createResponse } from '@app/shared/appresponse.shared';
import { messages } from '@app/shared/messages.shared';
import { HttpStatus } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { PassThrough } from 'stream';

const parseCsvBuffer = async (buffer: Buffer): Promise<any> => {
	try {
		const results = [];
		const stream = new PassThrough();
		stream.end(buffer);
		const parser = csvParser();
		return new Promise((resolve, reject) => {
			stream
				.pipe(parser)
				.on('data', (data) => results.push(data))
				.on('end', () => {
					resolve(createResponse(HttpStatus.OK, messages.S4, results));
				})
				.on('error', (error) => {
					reject(error);
				});
		});
	} catch (error) {
		return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, messages.E2);
	}
};
export { parseCsvBuffer };
