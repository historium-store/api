import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' compiler system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let compilerId;

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
		await mongoose.connection.collection('compilers').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/compiler/" Create new compiler ', () => {
		it(' Should create new compiler in database ', async () => {
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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					compilerId = response.body._id;
				});
		});
	});

	describe(' GET "/compiler/" Get all compilers ', () => {
		it(' Should return all compilers ', async () => {
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

	describe(' GET "/compiler/:id" Get one compiler ', () => {
		it(' Should return one compiler by id ', async () => {
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

	describe(' PATCH "/compiler/:id" Update one existing compiler ', () => {
		it(' Should return one compiler with updated data ', async () => {
			const updatedCompilerData = {
				fullName: 'Updated compiler name'
			};

			await request(app)
				.patch(`/compiler/${compilerId}`)
				.set('Authorization', userToken)
				.send(updatedCompilerData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.fullName).to.be.equal(
						'Updated compiler name'
					);
				});
		});
	});

	describe(' DELETE "/compiler/:id" Delete one compiler ', () => {
		it(' Should mark compiler as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/compiler/${compilerId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedCompiler = await mongoose.connection
						.collection('compilers')
						.findOne({});
					expect(deletedCompiler.deletedAt).to.not.be.null;
				});
		});
	});
});
