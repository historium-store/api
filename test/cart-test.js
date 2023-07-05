import { ObjectId } from 'bson';
import { expect } from 'chai';
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
		await mongoose.connection.collection('books').deleteMany();
		await mongoose.connection.collection('bookseries').deleteMany();
		await mongoose.connection.collection('authors').deleteMany();
		await mongoose.connection.collection('compilers').deleteMany();
		await mongoose.connection.collection('editors').deleteMany();
		await mongoose.connection.collection('illustrators').deleteMany();
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('publishers').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();
		await mongoose.connection.collection('translators').deleteMany();
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

	describe(' "/cart-item/" POST request | add item into cart', () => {
		it(' should return a 204 response and an empty body; the added element must match the expected "productId ', async () => {
			// adding the necessary objects to the database
			//#region

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
				sections: [sectionId]
			};
			productId = (
				await mongoose.connection
					.collection('products')
					.insertOne(product)
			).insertedId;

			//#endregion

			// creating new carItem with chosen product
			const newCartItem = {
				product: productId,
				quantity: 3
			};

			// request for adding new product(cartItem) into cart
			await request(app)
				.post('/cart-item/')
				.set('Authorization', userToken)
				.send(newCartItem)
				.then(async response => {
					//  getting user cart id
					const cartId = (
						await request(app)
							.get('/user/account')
							.set('Authorization', userToken)
					).body.cart;

					// getting cart object by id
					const cartObject = await mongoose.connection
						.collection('carts')
						.findOne(new ObjectId(cartId));

					// getting created cart item object
					const cartItemObject = await mongoose.connection
						.collection('cartitems')
						.findOne(new ObjectId(cartObject.items[0]));

					expect(response.status).to.equal(204);
					expect(cartItemObject.product.toString()).to.equal(
						productId.toString()
					);
				});
		});
	});

	describe(' "/cart-item/" DELETE request | remove item from cart ', () => {
		it(' should remove the specified item from the cart and return a 204 response and an empty body ', async () => {
			const cartItem = {
				product: productId,
				quantity: Number.MAX_SAFE_INTEGER
			};

			await request(app)
				.delete(`/cart-item/`)
				.set('Authorization', userToken)
				.send(cartItem)
				.then(async response => {
					expect(response.status).to.equal(204);

					//  getting user cart id
					const cartId = (
						await request(app)
							.get('/user/account')
							.set('Authorization', userToken)
					).body.cart;

					// getting cart object by id
					let cartObject = await mongoose.connection
						.collection('carts')
						.findOne(new ObjectId(cartId));

					// checking that collection 'cartitems' is empty
					expect(
						await mongoose.connection
							.collection('cartitems')
							.findOne()
					).to.be.null;

					expect(cartObject.items).to.be.empty;
				});
		});
	});
});
