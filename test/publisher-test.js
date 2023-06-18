import { expect } from 'chai';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' publisher system ', () => {
	let userToken = 'Bearer ';
	let publisherId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('publishers').deleteMany();
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

	describe(' "/publisher/" post request ', () => {
		it(' the publisher data is correct; the new publisher object is returned ', async () => {
			const newPublisher = {
				name: 'OpenAI',
				books: [],
				bookSeries: [],
				description: 'Publishing company specializing in AI research',
				logo: 'https://example.com/logo.png'
			};

			const expectedFields = [
				'name',
				'books',
				'bookSeries',
				'description',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/publisher/')
				.set('Authorization', userToken)
				.send(newPublisher)
				.then(response => {
					publisherId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/publisher/" get request ', () => {
		it(' should return an array of users ', async () => {
			await request(app)
				.get('/publisher/')
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

	describe(' "/publisher/:id" get request ', () => {
		it(' should return user object ', async () => {
			const expectedFields = [
				'name',
				'books',
				'bookSeries',
				'description',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/publisher/${publisherId}`)
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

	describe(' "/publisher/:id" patch request ', () => {
		it(' correct values are sent; the changed publisher object is returned ', async () => {
			const updatedPublisherData = {
				name: 'Updated Publisher',
				description:
					'This is an updated description with more than 40 characters.',
				logo: 'https://example.com/updated-logo.png'
			};
			const expectedFields = [
				'name',
				'books',
				'bookSeries',
				'description',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/publisher/${publisherId}`)
				.set('Authorization', userToken)
				.send(updatedPublisherData)
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
