import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' banner system ', () => {
	let userToken = 'Bearer ';
	let authorId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('banners').deleteMany();
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		const userData = {
			login: 'dobriy.edu@gmail.com',
			password: '41424344'
		};

		userToken += (await request(app).post('/login').send(userData))
			.body.token;
	});

	afterEach(() => {
		userToken = 'Bearer ';
	});

	describe(' "/banner/" POST request ', () => {
		it(' the banner data is correct; the new banner object is returned ', async () => {});
	});

	describe(' "/banner/" GET request ', () => {
		it(' should return an array of banners ', async () => {});
	});

	describe(' "/banner/:id" GET request ', () => {
		it(' should return banner object', async () => {});
	});

	describe(' "/banner/:id" PATCH request ', () => {
		it(' correct values are sent; the changed banner object is returned ', async () => {});
	});
});
