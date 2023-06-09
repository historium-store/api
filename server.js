import mongoose from 'mongoose';
import importData from './db-initialization.js';
import app from './src/app.js';

//importData().then(() => {
const PORT = process.env.PORT || 3000;

mongoose
	.connect(process.env.CONNECTION_STRING)
	.then(() =>
		app.listen(PORT, () =>
			console.log(`API is listening on port ${PORT}`)
		)
	)
	.catch(err => {
		console.log(`Failed to connect to database: ${err.message}`);
	});

process.on('unhandledRejection', event => {
	console.log(event.promise);
	console.log(event.reason);
});
//});
