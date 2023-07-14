import { ObjectId } from 'bson';
import { expect, use } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' product-type system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let productTypeId;

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
		await mongoose.connection.collection('producttypes').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/product-type/" Create new product type ', () => {
		it(' Should add new product type to database ', async () => {
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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					productTypeId = response.body._id;
				});
		});
	});

	describe(' GET "/product-type/" Get all product types ', () => {
		it(' Should return all product types ', async () => {
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

	describe(' GET "/product-type/:id" Get one product type ', () => {
		it(' Should return one product type by id ', async () => {
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

	describe(' PATCH "/product-type/:id" Update one existing product type ', () => {
		it(' Should return product type with updated data ', async () => {
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

	describe(' DELETE "/prodcut-type/:id" Delete one product type ', () => {
		it(' Should delete one product type from database ', async () => {
			await request(app)
				.delete(`/product-type/${productTypeId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const productTypeObject = await mongoose.connection
						.collection('producttypes')
						.findOne();
					expect(productTypeObject).to.be.null;
				});
		});
	});
});
