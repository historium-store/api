import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' product system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let productId;

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

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' GET "/product/" Create new product ', () => {
		it(' Should add new product to database. The value of the "currentProductsQuantity" property of the "products_quantity" collection should increase', async () => {
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

			const author = {
				fullName: 'John Smith',
				biography:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				books: [],
				pictures: ['picture1.jpg', 'picture2.jpg']
			};
			await mongoose.connection
				.collection('authors')
				.insertOne(author);
			const authorName = (
				await mongoose.connection.collection('authors').findOne({})
			).fullName;

			//#endregion

			const oldProductsQuantity = (
				await mongoose.connection
					.collection('products_quantity')
					.findOne({})
			).currentProductsQuantity;

			const product = {
				name: 'Збірка українських поезій',
				type: productTypeId,
				price: 99,
				quantity: 10,
				description:
					'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
				images: ['image1.png'],
				sections: [sectionId],
				creators: [authorName]
			};

			const expectedFields = [
				'name',
				'key',
				'price',
				'quantity',
				'type',
				'sections',
				'description',
				'reviews',
				'images',
				'creators',
				'requiresDelivery',
				'_id',
				'createdAt',
				'updatedAt',
				'code'
			];

			await request(app)
				.post('/product/')
				.set('Authorization', userToken)
				.send(product)
				.then(async response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					const newProductsQuantity = (
						await mongoose.connection
							.collection('products_quantity')
							.findOne({})
					).currentProductsQuantity;
					expect(newProductsQuantity).to.be.above(
						oldProductsQuantity
					);

					productId = response.body._id;
				});
		});
	});

	describe(' GET "/product/" Get all products ', () => {
		it(' Should return all products ', async () => {
			await request(app)
				.get('/product/')
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

	describe(' GET "/product/:id" Get one product ', () => {
		it(' Should return one product by id ', async () => {
			const expectedFields = [
				'name',
				'key',
				'price',
				'quantity',
				'type',
				'sections',
				'description',
				'reviews',
				'images',
				'creators',
				'requiresDelivery',
				'_id',
				'createdAt',
				'updatedAt',
				'code'
			];

			await request(app)
				.get(`/product/${productId}`)
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

	describe(' PATCH "/product/:id" Update one existing product ', () => {
		it(' Should return product with updated data  ', async () => {
			const updatedProductData = {
				price: 1000,
				quantity: 3
			};

			await request(app)
				.patch(`/product/${productId}`)
				.set('Authorization', userToken)
				.send(updatedProductData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.price).to.equal(
						updatedProductData.price
					);
					expect(response.body.quantity).to.equal(
						updatedProductData.quantity
					);
				});
		});
	});

	describe(' DELETE "/prodcut/:id" Delete one product ', () => {
		it(' Should mark product as deleted via the "deletedAt" field, but not delete ', async () => {
			//#region add necessary dependencies
			const publisher = {
				name: 'Квітка',
				books: [],
				bookSeries: []
			};
			const publisherId = (
				await mongoose.connection
					.collection('publishers')
					.insertOne(publisher)
			).insertedId;

			const book = {
				product: productId,
				publisher: publisherId,
				languages: ['Українська'],
				type: 'Паперова',
				publishedIn: 1994
			};
			await request(app)
				.post('/book/')
				.set('Authorization', userToken)
				.send(book);

			//#endregion

			await request(app)
				.delete(`/product/${productId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.equal(204);

					const product = await mongoose.connection
						.collection('products')
						.findOne({});
					expect(product.deletedAt).to.be.not.null;

					const book = await mongoose.connection
						.collection('books')
						.findOne({});
					expect(book.deletedAt).to.be.not.null;

					const section = await mongoose.connection
						.collection('sections')
						.findOne({});
					expect(section.products).to.be.empty;
				});
		});
	});
});
