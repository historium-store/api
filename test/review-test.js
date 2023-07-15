import { expect, use } from 'chai';
import { response } from 'express';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' review system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let reviewId;

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
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();
		await mongoose.connection.collection('reviews').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/review/" Create new review ', () => {
		it(' Should create new review ', async () => {
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
				price: 99,
				deliveryPrice: 60,
				quantity: 10,
				description:
					'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
				images: ['image1.png'],
				sections: [sectionId],
				model: 'Book'
			};
			const productId = (
				await request(app)
					.post('/product/')
					.set('Authorization', userToken)
					.send(product)
			).body._id;

			const userId = (
				await mongoose.connection.collection('users').findOne({})
			)._id;

			//#endregion

			const review = {
				product: productId,
				user: userId,
				title: 'Приголомшлива книжкова подорож',
				text: 'Ця книга змушує вас погрузнутися у захопливий світ, де кожна сторінка відкриває нові глибини емоцій та незабутніх пригод. Ви не зможете відірвати очі від її сторінок, а кожне речення залишить слід у вашому серці.',
				rating: 5
			};

			const expectedFields = [
				'product',
				'user',
				'title',
				'text',
				'likes',
				'dislikes',
				'rating',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/review/')
				.set('Authorization', userToken)
				.send(review)
				.then(response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					reviewId = response.body._id;
				});
		});
	});

	describe(' PATCH "/review/:id" Update one existing review ', () => {
		it(' Should return one section with updated data ', async () => {
			const updatedReviewData = {
				title: 'Приголомшлива подорож.'
			};

			await request(app)
				.patch(`/review/${reviewId}`)
				.set('Authorization', userToken)
				.send(updatedReviewData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.title).to.be.equal(
						'Приголомшлива подорож.'
					);
				});
		});
	});

	describe(' DELETE "/review/:id" Delete one review ', () => {
		it(' Should mark review as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/review/${reviewId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.equal(204);

					const review = await mongoose.connection
						.collection('reviews')
						.findOne({});
					expect(review.deletedAt).to.be.not.null;
				});
		});
	});
});
