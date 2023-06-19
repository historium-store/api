import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' compiler system ', () => {
	let userToken = 'Bearer ';
	let compilerId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('compilers').deleteMany();
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

	describe(' "/compiler/" POST request ', () => {
		it(' the compiler data is correct; the new compiler object is returned ', async () => {
			const newCompiler = {
				fullName: 'John Smith',
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
				.post('/compiler/')
				.set('Authorization', userToken)
				.send(newCompiler)
				.then(response => {
					compilerId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/compiler/" GET request ', () => {
		it(' should return an array of compilers ', async () => {
			await request(app)
				.get('/compiler/')
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

	describe(' "/compiler/:id" GET request ', () => {
		it(' should return compiler object ', async () => {
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/compiler/${compilerId}`)
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

	describe(' "/compiler/:id" PATCH request ', () => {
		it(' correct values are sent; the changed compiler object is returned ', async () => {
			const updatedCompilerData = {
				fullName: 'Updated compiler name'
			};
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/compiler/${compilerId}`)
				.set('Authorization', userToken)
				.send(updatedCompilerData)
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
