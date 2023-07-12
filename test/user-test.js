import { ObjectId } from 'bson';
import { expect } from 'chai';
import { response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe('user system', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();
		await mongoose.connection
			.collection('users')
			.deleteMany({ role: { $ne: 'admin' } });
		await mongoose.connection
			.collection('users')
			.findOneAndUpdate({}, { $set: { wishlist: [] } });
		await mongoose.connection
			.collection('users')
			.findOneAndUpdate({}, { $set: { history: [] } });

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
	let productId, userId;

	describe(' GET "/user/" Get all users ', () => {
		it(' Should return an array of users ', async () => {
			await request(app)
				.get('/user/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.be.an('array');

					userId = response.body[0]._id;
				});
		});
	});

	describe(' GET "/user/:id" Get one user ', () => {
		it(' Should return user by id ', async () => {
			const expectedFields = [
				'_id',
				'firstName',
				'lastName',
				'phoneNumber',
				'email',
				'role',
				'reviews',
				'wishlist',
				'createdAt',
				'updatedAt',
				'cart'
			];

			await request(app)
				.get(`/user/${userId}`)
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

	describe(' PATCH "/user/:id" Update one existing user ', () => {
		it(' Should return the user with updated data ', async () => {
			const newData = {
				firstName: 'Артем',
				lastName: 'Желіковський'
			};

			await request(app)
				.patch(`/user/${userId}`)
				.set('Authorization', userToken)
				.send(newData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body.firstName).to.equal(newData.firstName);
					expect(response.body.lastName).to.equal(newData.lastName);
				});
		});
	});

	describe(' DELETE "/user/:id" Delete one user ', () => {
		it(' Should mark the user as deleted via the "deletedAt" field, but not delete him ', async () => {
			const newUser = {
				firstName: 'Oleg',
				lastName: 'Smirniv',
				phoneNumber: '380957846372',
				email: 'lahefi3700@devswp.com',
				password: '41424344',
				role: 'user'
			};

			const userId = (
				await mongoose.connection
					.collection('users')
					.insertOne(newUser)
			).insertedId.toString();

			await request(app)
				.delete(`/user/${userId}`)
				.set('Authorization', userToken)
				.then(async () => {
					const deletedUser = await mongoose.connection
						.collection('users')
						.findOne({ email: 'lahefi3700@devswp.com' });

					expect(deletedUser).to.include.keys('deletedAt');
				});
		});
	});

	describe(' GET "/user/account" Get user account ', () => {
		it(' Should return information about the authorized user ', async () => {
			const expectedFields = [
				'_id',
				'firstName',
				'lastName',
				'phoneNumber',
				'email',
				'role',
				'reviews',
				'wishlist',
				'createdAt',
				'updatedAt',
				'cart'
			];

			await request(app)
				.get(`/user/${userId}`)
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

	describe(` POST "/user/wishlist/" Add product to user's wishlist `, () => {
		it(' Should add product to wishlist ', async () => {
			//#region adding the necessary objects to the database

			const productType = {
				name: 'Книга',
				key: 'book'
			};
			const productTypeId = (
				await mongoose.connection
					.collection('producttypes')
					.insertOne(productType)
			).insertedId;

			const section = {
				name: 'Фантастика',
				key: 'fantastic',
				products: [],
				sections: []
			};
			const sectionId = (
				await mongoose.connection
					.collection('sections')
					.insertOne(section)
			).insertedId;

			const product = {
				name: 'Збірка українських поезій',
				type: productTypeId,
				price: 99.99,
				quantity: 10,
				description:
					'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
				images: ['image1.png'],
				sections: [sectionId],
				model: 'Book'
			};
			productId = (
				await mongoose.connection
					.collection('products')
					.insertOne(product)
			).insertedId;

			//#endregion

			const requestBody = {
				product: productId
			};

			await request(app)
				.post('/user/wishlist')
				.set('Authorization', userToken)
				.send(requestBody)
				.then(async response => {
					expect(response.status).to.equal(204);

					const userWishlist = (
						await mongoose.connection.collection('users').findOne()
					).wishlist;

					expect(
						userWishlist.map(obj => obj.toString())
					).to.be.include(productId.toString());
				});
		});
	});

	describe(` DELETE "/user/wishlist/" Remove product from user's wishlist `, () => {
		it(' Must remove product from wishlist ', async () => {
			const requestBody = {
				product: productId
			};

			await request(app)
				.delete('/user/wishlist/')
				.set('Authorization', userToken)
				.send(requestBody)
				.then(async response => {
					expect(response.status).to.equal(204);

					const userWishlist = (
						await mongoose.connection.collection('users').findOne()
					).wishlist;

					expect(userWishlist).to.be.empty;
				});
		});
	});

	//!!!!!!!!!!!!!
	describe(` POST "/user/history/" Add product to user's viewed products history `, () => {
		it(' Should add new element to "history" array ', async () => {
			await request(app)
				.get(`/user/history/`)
				.set('Authorization', userToken)
				.send(productId)
				.then(async response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					const user = await mongoose.connection
						.collection('users')
						.findOne();

					console.log(user.history); // = []
				});
		});
	});

	describe(` GET "/user/orders/" Get all orders made by user `, () => {
		it(' Should return an array of orders ', async () => {
			await request(app)
				.get(`/user/orders/`)
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
});
