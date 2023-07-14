import { expect } from 'chai';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe('auth system', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' "/signup" Create new user ', () => {
		it('The data should be validated and the body of the created user should be returned', async () => {
			const expectedFields = [
				'firstName',
				'lastName',
				'phoneNumber',
				'email',
				'role',
				'reviews',
				'_id',
				'createdAt',
				'updatedAt',
				'history',
				'wishlist',
				'waitlist'
			];

			await request(app)
				.post('/signup')
				.send(adminUser)
				.then(async response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/login" Login existing user ', () => {
		it('The password and login are correct, the token is returned', async () => {
			const inputData = {
				login: adminUser.email,
				password: adminUser.password
			};

			await request(app)
				.post('/login')
				.send(inputData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys('token');
				});
		});
	});
});
