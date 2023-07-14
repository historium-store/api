import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' editor system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let editorId;

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
		await mongoose.connection.collection('editors').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/editor/" Create new editor ', () => {
		it(' Should create new editor in database ', async () => {
			const newEditor = {
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
				.post('/editor/')
				.set('Authorization', userToken)
				.send(newEditor)
				.then(response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					editorId = response.body._id;
				});
		});
	});

	describe(' GET "/editor/" Get all editors ', () => {
		it(' Should return all editors ', async () => {
			await request(app)
				.get('/editor/')
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

	describe(' GET "/editor/:id" Get one editor ', () => {
		it(' Should return one editor by id  ', async () => {
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/editor/${editorId}`)
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

	describe(' PATCH "/editor/:id" Update one existing editor ', () => {
		it(' Should return one editor with updated data ', async () => {
			const updatedEditorData = {
				fullName: 'Updated editor name'
			};

			await request(app)
				.patch(`/editor/${editorId}`)
				.set('Authorization', userToken)
				.send(updatedEditorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.fullName).to.be.equal(
						'Updated editor name'
					);
				});
		});
	});

	describe(' DELETE "/editor/:id" Delete one editor ', () => {
		it(' Should mark editor as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/editor/${editorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedEditor = await mongoose.connection
						.collection('editors')
						.findOne({});
					expect(deletedEditor.deletedAt).to.not.be.null;
				});
		});
	});
});
