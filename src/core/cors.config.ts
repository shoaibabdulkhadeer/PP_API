/*
corsOptions: This object likely contains your custom CORS configuration settings. These settings define which origins, HTTP methods, headers, and other parameters are allowed or disallowed when making cross-origin requests to your API.

For example, your corsOptions object might look something like this:

	const corsOptions = {
	origin: 'http://example.com', // Allow requests from this origin
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
	credentials: true, // Allow credentials (e.g., cookies) to be included in requests
	allowedHeaders: 'Content-Type,Authorization', // Allow these headers in requests
	};
*/

export const corsOptions = {
	origin: '*'
};
