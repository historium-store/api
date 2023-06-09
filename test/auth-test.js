import { expect } from 'chai';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe('auth system', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.close();
	});

	describe(' "/signup" Create new user ', () => {
		it('The data should be validated and the body of the created user should be returned', async () => {
			const newUser = {
				firstName: 'Artem',
				lastName: 'Zhelikovskij',
				phoneNumber: '+380997846872',
				email: 'dobriy.edu@gmail.com',
				password: '41424344'
			};

			const expectedFields = [
				'firstName',
				'lastName',
				'phoneNumber',
				'email',
				'password',
				'salt',
				'role',
				'reviews',
				'_id',
				'createdAt',
				'updatedAt',
				'history',
				'products',
				'wishlist'
			];

			await request(app)
				.post('/signup')
				.send(newUser)
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
				login: 'dobriy.edu@gmail.com',
				password: '41424344'
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
