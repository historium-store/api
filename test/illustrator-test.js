import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' illustrator system ', () => {
	let userToken = 'Bearer ';
	let illustratorId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('illustrators').deleteMany();
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

	describe(' "/illustrator/" post request ', () => {
		it(' the illustrator data is correct; the new illustrator object is returned ', async () => {
			const newIllustrator = {
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
				.post('/illustrator/')
				.set('Authorization', userToken)
				.send(newIllustrator)
				.then(response => {
					illustratorId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/illustrator/" get request ', () => {
		it(' should return an array of illustrator ', async () => {
			await request(app)
				.get('/illustrator/')
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

	describe(' "/illustrator/:id" get request ', () => {
		it(' should return illustrator object ', async () => {
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/illustrator/${illustratorId}`)
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

	describe(' "/illustrator/:id" patch request ', () => {
		it(' correct values are sent; the changed illustrator object is returned ', async () => {
			const updatedIllustratorData = {
				fullName: 'Updated illustrator name'
			};
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/illustrator/${illustratorId}`)
				.set('Authorization', userToken)
				.send(updatedIllustratorData)
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
