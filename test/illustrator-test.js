import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' illustrator system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let illustratorId;

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
		await mongoose.connection.collection('illustrators').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/illustrator/" Create new illustrator ', () => {
		it(' Shold create new illustrator in database ', async () => {
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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					illustratorId = response.body._id;
				});
		});
	});

	describe(' GET "/illustrator/" Get all illustrators ', () => {
		it(' Should return all illustrators ', async () => {
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

	describe(' GET "/illustrator/:id" Get one illustrator ', () => {
		it(' Should return one illustrator by id ', async () => {
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

	describe(' PATCH "/illustrator/:id" Update one existing illustrator ', () => {
		it(' Should return one illustrator with updated data ', async () => {
			const updatedIllustratorData = {
				fullName: 'Updated illustrator name'
			};

			await request(app)
				.patch(`/illustrator/${illustratorId}`)
				.set('Authorization', userToken)
				.send(updatedIllustratorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.fullName).to.be.equal(
						'Updated illustrator name'
					);
				});
		});
	});

	describe(' DELETE "/illustrator/:id" Delete one illustrator ', () => {
		it(' Should mark illustrator as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/illustrator/${illustratorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedIllustrator = await mongoose.connection
						.collection('illustrators')
						.findOne({});
					expect(deletedIllustrator.deletedAt).to.not.be.null;
				});
		});
	});
});
