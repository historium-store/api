import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' section system', () => {
	let userToken = 'Bearer ';
	let sectionId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('sections').deleteMany();
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

	describe(' "/section/" POST request ', () => {
		it(' the section data is correct; the new section object is returned ', async () => {
			const newSection = {
				name: 'Fantastic',
				key: 'fantastic',
				products: [],
				sections: []
			};

			const expectedFields = [
				'name',
				'key',
				'products',
				'_id',
				'sections',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/section/')
				.set('Authorization', userToken)
				.send(newSection)
				.then(response => {
					sectionId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/section/" GET request ', () => {
		it(' should return an array of sections ', async () => {
			await request(app)
				.get('/section/')
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

	describe(' "/section/:id" GET request ', () => {
		it(' should return section object', async () => {
			const expectedFields = ['name', 'key', '_id', 'sections'];

			await request(app)
				.get(`/section/${sectionId}`)
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

	describe(' "/section/:id" PATCH request ', () => {
		it(' correct values are sent; the changed section object is returned ', async () => {
			const updatedSectionData = {
				key: 'fc'
			};

			await request(app)
				.patch(`/section/${sectionId}`)
				.set('Authorization', userToken)
				.send(updatedSectionData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body.key).to.equal('fc');
				});
		});
	});

	describe(' "/section/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object cannot be obtained using a request, but it is in the database ', async () => {
			await request(app)
				.delete(`/section/${sectionId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get arr of sections from request
					const sections = (
						await request(app)
							.get('/section/')
							.set('Authorization', userToken)
					).body;

					// get section object from db
					const sectionObject = await mongoose.connection
						.collection('sections')
						.findOne(new ObjectId(sectionId));

					expect(response.status).to.be.equal(204);
					expect(sections).to.be.empty;
					expect(sectionObject.deletedAt).to.not.be.null;
				});
		});
	});
});
