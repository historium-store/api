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
			.findOneAndUpdate({}, { $set: { wishlist: [] } });

		await mongoose.connection.close();
	});

	let userToken = 'Bearer ';
	let productId;

	describe(' "/user/" GET request ', () => {
		it('The token is correct; the role is correct; an array of users should be returned', async () => {
			const userData = {
				login: 'dobriy.edu@gmail.com',
				password: '41424344'
			};

			userToken += (await request(app).post('/login').send(userData))
				.body.token;

			await request(app)
				.get('/user/')
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

	describe(' "/user/:id" DELETE request ', () => {
		it.skip(' should change the user property "deletedAt". The user is no longer displayed in the list of all users, but is not removed from the database', async () => {
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
				.then(async response => {
					console.log(response.body);
				});
		});
	});

	describe(' "/user/wishlist/" POST request ', () => {
		it(' Product added to wishlist successfully ', async () => {
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

	describe(' "/user/wishlist/" DELETE request ', () => {
		it(' Product removed from wishlist successfully ', async () => {
			const requestBody = {
				product: productId
			};

			await request(app)
				.delete('/user/wishlist')
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
});
