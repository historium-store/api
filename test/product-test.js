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

	describe(' "/product/" GET request ', () => {
		it(' should return "result" -  an array of products, and "total" - count of products ', async () => {
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

			const publisher = {
				name: 'Новий Вік',
				books: [],
				bookSeries: [],
				description:
					'Видавництво, спеціалізуючеся на публікації літератури різних жанрів',
				logo: 'https://example.com/logo.png'
			};
			const publisherId = (
				await mongoose.connection
					.collection('publishers')
					.insertOne(publisher)
			).insertedId;

			const author = {
				fullName: 'Іван Сидоренко',
				biography: 'Текст біографії автора на українській мові.',
				books: [],
				pictures: ['picture1.jpg', 'picture2.jpg']
			};
			const authorId = (
				await mongoose.connection
					.collection('authors')
					.insertOne(author)
			).insertedId;

			const compiler = {
				fullName: 'Іван Бойко',
				books: []
			};
			const compilerId = (
				await mongoose.connection
					.collection('compilers')
					.insertOne(compiler)
			).insertedId;

			const translator = {
				fullName: 'Анна Мельник',
				books: []
			};
			const translatorId = (
				await mongoose.connection
					.collection('translators')
					.insertOne(translator)
			).insertedId;

			const illustrator = {
				fullName: 'Ірина Левченко',
				books: []
			};
			const illustratorId = (
				await mongoose.connection
					.collection('illustrators')
					.insertOne(illustrator)
			).insertedId;

			const editor = {
				fullName: 'Юлія Григоренко',
				books: []
			};
			const editorId = (
				await mongoose.connection
					.collection('editors')
					.insertOne(editor)
			).insertedId;

			const bookSeries = {
				name: 'Українська класика',
				publisher: publisherId,
				books: []
			};
			const bookSeriesId = (
				await mongoose.connection
					.collection('bookseries')
					.insertOne(bookSeries)
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
				await request(app)
					.post('/product/')
					.set('Authorization', userToken)
					.send(product)
			).body._id;

			const book = {
				product: productId,
				type: 'Паперова',
				publisher: publisherId,
				languages: ['Українська'],
				publishedIn: '1980',
				authors: [authorId],
				compilers: [compilerId],
				translators: [translatorId],
				illustrators: [illustratorId],
				editors: [editorId],
				series: [bookSeriesId],
				copies: 100,
				isbns: ['978-3-16-148410-0'],
				firstPublishedIn: '1981',
				originalName: 'Збірка українських поезій',
				font: 'Arial',
				format: '135х205 мм',
				pages: 180,
				weight: 300,
				bindingType: 'Пришивна палітурка',
				paperType: 'Глянцевий',
				illustrationsType: ['Повнокольоровий'],
				literaturePeriod: ['Постмодернізм'],
				literatureCountry: ['Україна'],
				foreignLiterature: false,
				timePeriod: ['1980-1990'],
				suitableAge: ['12+'],
				packaging: 'У коробці',
				occasion: ['Без приводу'],
				style: ['Сучасна поезія'],
				suitableFor: ['Дорослих']
			};
			const bookId = (
				await request(app)
					.post('/book/')
					.set('Authorization', userToken)
					.send(book)
			).body._id;

			//#endregion

			await request(app)
				.get('/product/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.result).to.be.an('array').and.not
						.empty;
				});
		});
	});

	describe(' "/product/:id" GET request ', () => {
		it(' should return product object ', async () => {
			const expectedFields = [
				'_id',
				'name',
				'key',
				'price',
				'quantity',
				'type',
				'model',
				'sections',
				'description',
				'reviews',
				'images',
				'createdAt',
				'updatedAt',
				'code',
				'specificProduct'
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

	describe(' "/product/:id" PATCH request ', () => {
		it(' should return updated product ', async () => {
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

	describe(' "/prodcut/:id" DELETE request ', () => {
		it(' should set field "deletedAt" for product and book objects ', async () => {
			await request(app)
				.delete(`/product/${productId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const product = await mongoose.connection
						.collection('products')
						.findOne();
					expect(product.deletedAt).to.not.be.null;

					const book = await mongoose.connection
						.collection('books')
						.findOne(product.specificProduct);
					expect(book.deletedAt).to.not.be.null;

					//#region checking all dependencies

					const section = await mongoose.connection
						.collection('sections')
						.findOne(product.sections[0]);
					expect(section.products).to.be.empty;

					const author = await mongoose.connection
						.collection('authors')
						.findOne(book.authors[0]);
					expect(author.books).to.be.empty;

					const compiler = await mongoose.connection
						.collection('compilers')
						.findOne(book.compilers[0]);
					expect(compiler.books).to.be.empty;

					const translator = await mongoose.connection
						.collection('translators')
						.findOne(book.translators[0]);
					expect(translator.books).to.be.empty;

					const illustrator = await mongoose.connection
						.collection('illustrators')
						.findOne(book.illustrators[0]);
					expect(illustrator.books).to.be.empty;

					const editor = await mongoose.connection
						.collection('editors')
						.findOne(book.editors[0]);
					expect(editor.books).to.be.empty;

					const series = await mongoose.connection
						.collection('bookseries')
						.findOne(book.series);
					expect(series.books).to.be.empty;

					//#endregion
				});
		});
	});
});
