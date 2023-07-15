import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' translator system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let translatorId;

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
		await mongoose.connection.collection('translators').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/translator/" Create new translator ', () => {
		it(' Should create new translator in database ', async () => {
			const newTranslator = {
				fullName: 'Anna Petrova',
				books: []
			};

			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/translator/')
				.set('Authorization', userToken)
				.send(newTranslator)
				.then(response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);

					translatorId = response.body._id;
				});
		});
	});

	describe(' GET "/translator/" Get all translators ', () => {
		it(' Should return all translators ', async () => {
			await request(app)
				.get('/translator/')
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

	describe(' GET "/translator/:id" Get one translator ', () => {
		it(' Should return one translator by id ', async () => {
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/translator/${translatorId}`)
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

	describe(' PATCH "/translator/:id" Update one existing translator ', () => {
		it(' Should return one translator with updated data ', async () => {
			const updatedTranslatorData = {
				fullName: 'Updated translator name'
			};

			await request(app)
				.patch(`/translator/${translatorId}`)
				.set('Authorization', userToken)
				.send(updatedTranslatorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.fullName).to.be.equal(
						'Updated translator name'
					);
				});
		});
	});

	describe(' DELETE "/translator/:id" Delete one translator ', () => {
		it(' Should mark translator as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/translator/${translatorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedTranslator = await mongoose.connection
						.collection('translators')
						.findOne({});
					expect(deletedTranslator.deletedAt).to.be.not.null;
				});
		});
	});
});
