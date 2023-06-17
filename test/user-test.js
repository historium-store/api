import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe('user system', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.close();
	});

	describe(' "/user/" request ', () => {
		it('The token is correct; the role is correct; an array of users should be returned', async () => {
			let userToken = 'Bearer ';

			const userData = {
				login: 'dobriy.edu@gmail.com',
				password: '41424344'
			};

			userToken += (await request(app).post('/login').send(userData))
				.body.token;

			await request(app)
				.get('/user/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.be.an('array');
				});
		});
	});
});
