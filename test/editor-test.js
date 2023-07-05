import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' editor system ', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('editors').deleteMany();
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

	let userToken = 'Bearer ';
	let editorId;

	describe(' "/editor/" post request ', () => {
		it(' the editor data is correct; the new editor object is returned ', async () => {
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
					editorId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/editor/" get request ', () => {
		it(' should return an array of editors ', async () => {
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

	describe(' "/editor/:id" get request ', () => {
		it(' should return editor object ', async () => {
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

	describe(' "/editor/:id" patch request ', () => {
		it(' correct values are sent; the changed editor object is returned ', async () => {
			const updatedEditorData = {
				fullName: 'Updated editor name'
			};
			const expectedFields = [
				'fullName',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/editor/${editorId}`)
				.set('Authorization', userToken)
				.send(updatedEditorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/editor/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object cannot be obtained using a request, but it is in the database ', async () => {
			await request(app)
				.delete(`/editor/${editorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get arr of editors from request
					const editors = (
						await request(app)
							.get('/editor/')
							.set('Authorization', userToken)
					).body;

					// get editor object from db
					const editorObject = await mongoose.connection
						.collection('editors')
						.findOne(new ObjectId(editorId));

					expect(response.status).to.be.equal(204);
					expect(editors).to.be.empty;
					expect(editorObject.deletedAt).to.not.be.null;
				});
		});
	});
});
