import { ObjectId } from 'bson';
import { expect, use } from 'chai';
import { response } from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' cart system ', () => {
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
			.collection('carts')
			.updateOne({}, { $set: { items: [] } });
		await mongoose.connection.collection('cartitems').deleteMany();

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
	let productId;

	describe(' GET "/cart/" Get cart associated with user ', () => {
		it(' Should return information about the cart of the authorized user ', async () => {
			const expectedFields = ['items', 'totalPrice', 'totalQuantity'];

			await request(app)
				.get('/cart/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.be.include.keys(...expectedFields);
				});
		});
	});

	describe(' DELETE "/cart/" Clear user cart ', () => {
		it(' Should empty cart of the authorized user ', async () => {
			await request(app)
				.delete('/cart/')
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.equal(204);

					const cart = await mongoose.connection
						.collection('carts')
						.findOne({});
					expect(cart.items).to.be.empty;
				});
		});
	});

	describe(' POST "/cart-item/" Add item to user cart ', () => {
		it(' Should add the product to the cart of an authorized user ', async () => {
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
			productId = (
				await request(app)
					.post('/product/')
					.set('Authorization', userToken)
					.send(product)
			).body._id;

			//#endregion

			const body = {
				product: productId.toString()
			};

			await request(app)
				.post('/cart-item/')
				.set('Authorization', userToken)
				.send(body)
				.then(async response => {
					expect(response.status).to.equal(204);

					const cart = await mongoose.connection
						.collection('carts')
						.findOne({});
					expect(cart.items).to.be.not.empty;

					const cartItem = await mongoose.connection
						.collection('cartitems')
						.findOne({ _id: cart.items[0] });
					expect(cartItem.product.toString()).to.be.equal(productId);
				});
		});
	});

	describe(' DELETE "/cart-item/" Remove item from user cart ', () => {
		it(' Should remove the product from the cart of an authorized user ', async () => {
			const body = {
				product: productId.toString()
			};

			await request(app)
				.delete('/cart-item/')
				.set('Authorization', userToken)
				.send(body)
				.then(async response => {
					expect(response.status).to.equal(204);

					const cart = await mongoose.connection
						.collection('carts')
						.findOne({});
					expect(cart.items).to.be.empty;

					const cartItems = await mongoose.connection
						.collection('cartitems')
						.findOne({});
					expect(cartItems).to.be.null;
				});
		});
	});
});
