import { ObjectId } from 'bson';
import { expect } from 'chai';
import { response } from 'express';
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

	describe(' POST "/section/" Create new section ', () => {
		it(' Should add new section to database ', async () => {
			const section = {
				name: 'Художня література',
				key: 'khudozhnia-literatura',
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
				.send(section)
				.then(response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					sectionId = response.body._id;
				});
		});
	});

	describe(' GET "/section/" Get all sections ', () => {
		it(' Should return all sections  ', async () => {
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

	describe(' GET "/section/:id" Get one section ', () => {
		it(' Should return one section by id ', async () => {
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

	describe(' PATCH "/section/:id" Update one existing section ', () => {
		it(' Should return updated section ', async () => {
			//#region adding the necessary objects to the database

			const newSection = {
				name: 'Фантастика',
				key: 'fantastic',
				products: [],
				sections: []
			};
			const newSectionId = (
				await mongoose.connection
					.collection('sections')
					.insertOne(newSection)
			).insertedId;

			//#endregion

			const updatedSectionData = {
				sections: [newSectionId]
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

					expect(response.body.sections).to.include(
						newSectionId.toString()
					);
				});
		});
	});

	describe(' GET "/section/:id/products" Get all section products ', () => {
		it(' Should return all section products ', async () => {
			await request(app)
				.get(`/section/${sectionId}/products`)
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.result).to.be.an('array');
				});
		});
	});

	describe(' DELETE "/section/:id" Delete one section ', () => {
		it(' Should mark section as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/section/${sectionId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.equal(204);

					const section = await mongoose.connection
						.collection('sections')
						.findOne({ _id: new ObjectId(sectionId) });
					expect(section.deletedAt).not.be.null;
				});
		});
	});
});
