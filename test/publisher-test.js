import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' publisher system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let publisherId;

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
		await mongoose.connection.collection('publishers').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/publisher/" Create new publisher ', () => {
		it(' Should create new publisher ', async () => {
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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					publisherId = response.body._id;
				});
		});
	});

	describe(' GET "/publisher/" Get all publishers ', () => {
		it(' Should return fll publishers ', async () => {
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

	describe(' GET "/publisher/:id" Get one publisher ', () => {
		it(' Should return one publisher by id ', async () => {
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

	describe(' PATCH "/publisher/:id" Update one existing publisher ', () => {
		it(' Should return one publisher with updated data ', async () => {
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

	describe(' DELETE "/publisher/:id" Delete one publisher ', () => {
		it(' Should mark section as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/publisher/${publisherId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const publisher = await mongoose.connection
						.collection('publishers')
						.findOne({});
					expect(publisher.deletedAt).to.be.not.null;
				});
		});
	});
});
