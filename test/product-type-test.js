import { ObjectId } from 'bson';
import { expect, use } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' product-type system ', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('producttypes').deleteMany();
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
	let productTypeId;

	describe(' "/product-type/" POST request ', () => {
		it(' the product-type data is correct; the new product type object is returnd ', async () => {
			const newProductType = {
				name: 'Book',
				key: 'book'
			};

			const expectedFields = [
				'name',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/product-type/')
				.set('Authorization', userToken)
				.send(newProductType)
				.then(response => {
					productTypeId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/product-type/" GET request ', () => {
		it(' should return an array of prdocut types ', async () => {
			await request(app)
				.get('/product-type/')
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

	describe(' "/product-type/:id" GET request ', () => {
		it(' should return product type object ', async () => {
			const expectedFields = [
				'name',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/product-type/${productTypeId}`)
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

	describe(' "/product-type/:id" PATCH request ', () => {
		it(' correct values are sent; updated product type object is returned ', async () => {
			const updatedProductTypeData = {
				name: 'E-Book',
				key: 'e-book'
			};

			const expectedFields = [
				'name',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/product-type/${productTypeId}`)
				.set('Authorization', userToken)
				.send(updatedProductTypeData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/prodcut-type/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object must be removed from the database ', async () => {
			await request(app)
				.delete(`/product-type/${productTypeId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get section object from db
					const productTypeObject = await mongoose.connection
						.collection('producttypes')
						.findOne();

					expect(response.status).to.be.equal(204);
					expect(productTypeObject).to.be.null;
				});
		});
	});
});
