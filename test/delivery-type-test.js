import { ObjectId } from 'bson';
import { expect } from 'chai';
import { response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' delivery type system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';

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
		await mongoose.connection
			.collection('deliverytypes')
			.deleteMany();
		await mongoose.connection.collection('countries').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' GET "/delivery-type/" Get all delivery types ', () => {
		before(async () => {
			const country = {
				name: 'Україна',
				cities: ['Одеса', 'Житомир'],
				key: 'ukraine'
			};
			const countryId = (
				await mongoose.connection
					.collection('countries')
					.insertOne(country)
			).insertedId;

			const deliveryType = {
				name: 'Відділення Нова Пошта',
				price: 60,
				countries: [countryId],
				contactInfoRequired: false,
				fullAddressRequired: false,
				paymentTypes: [
					'Оплата карткою On-line',
					'Готівкою або карткою: При отриманні',
					'Передплата: по б/г рахунку (для юр. осіб)'
				],
				variablePrice: false,
				key: 'viddilennya-nova-poshta'
			};
			await mongoose.connection
				.collection('deliverytypes')
				.insertOne(deliveryType);
		});

		it(' Should return all delivery types ', async () => {
			await request(app)
				.get('/delivery-type/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.be.an('array').and.not.be.empty;
				});
		});
	});
});
