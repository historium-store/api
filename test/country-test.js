import { ObjectId } from 'bson';
import { expect } from 'chai';
import { response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' country system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let countryId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});

		//#region add admin user to db and take token

		await request(app).post('/signup').send(adminUser);
		await mongoose.connection
			.collection('users')
			.updateOne(
				{ email: adminUser.email },
				{ $set: { role: 'admin' } }
			);

		const userData = {
			login: adminUser.email,
			password: adminUser.password
		};

		userToken += (await request(app).post('/login').send(userData))
			.body.token;

		//#endregion
	});

	after(async () => {
		await mongoose.connection.collection('countries').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' GET "/country/" Get all countries ', () => {
		before(async () => {
			const country = {
				name: 'Україна',
				cities: ['Одеса', 'Житомир'],
				key: 'ukraine'
			};
			countryId = (
				await mongoose.connection
					.collection('countries')
					.insertOne(country)
			).insertedId;
		});
		it(' Should return all countries ', async () => {
			await request(app)
				.get('/country/')
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

	describe(' GET "/country/:id" Get one country ', () => {
		it(' Should return one country by id ', async () => {
			const expectedFields = ['name', 'cities'];
			await request(app)
				.get(`/country/${countryId}`)
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});
});
