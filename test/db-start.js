import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const Connect = async () => {
	const mongoServer = new MongoMemoryServer();

	const PORT = process.env.PORT || 3000;

	mongoose
		.connect(await mongoServer.getUri())
		.then(() =>
			app.listen(PORT, () =>
				console.log(`API is listening on port ${PORT}`)
			)
		)
		.catch(err => {
			console.log(`Failed to connect to database: ${err.message}`);
		});

	return mongoose;
};

export default Connect;
