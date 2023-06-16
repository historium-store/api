import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { request } from 'supertest';

describe('Publisher requests test', () => {
	before(async () => {
		const mongod = await MongoMemoryServer.create();

		await mongoose.connect(mongod.getUri());
	});

	after(async () => {
		mongoose.connection.close();
		mongod.stop();
	});
});
