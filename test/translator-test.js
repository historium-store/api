import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' translator system ', () => {
	let userToken = 'Bearer ';
	let translatorId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('translators').deleteMany();
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

	describe(' "/translator/" post request ', () => {
		it(' the translator data is correct; the new translator object is returned ', async () => {
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
					translatorId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/translator/" get request ', () => {
		it(' should return an array of translators ', async () => {
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

	describe(' "/translator/:id" get request ', () => {
		it(' should return translator object ', async () => {
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

	describe(' "/translator/:id" patch request ', () => {
		it(' correct values are sent; the changed translator object is returned ', async () => {
			const updatedTranslatorData = {
				fullName: 'Updated translator name'
			};
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/translator/${translatorId}`)
				.set('Authorization', userToken)
				.send(updatedTranslatorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/translator/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object cannot be obtained using a request, but it is in the database ', async () => {
			await request(app)
				.delete(`/translator/${translatorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get arr of translator from request
					const translators = (
						await request(app)
							.get('/translator/')
							.set('Authorization', userToken)
					).body;

					// get translator object from db
					const translatorObject = await mongoose.connection
						.collection('translators')
						.findOne(new ObjectId(translatorId));

					expect(response.status).to.be.equal(204);
					expect(translators).to.be.empty;
					expect(translatorObject.deletedAt).to.not.be.null;
				});
		});
	});
});
