import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' boook system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let bookId;

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

	describe(' POST "/book/" Create new book ', async () => {
		it(' Should create new book to database ', async () => {
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
				name: 'Комікси і графічні романи',
				key: 'Komiksy i hrafichni romany',
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
			const authorName = (
				await mongoose.connection.collection('authors').findOne({})
			).fullName;

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
				price: 99,
				quantity: 10,
				description:
					'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
				images: ['image1.png'],
				sections: [sectionId],
				creators: [authorName]
			};
			const productId = (
				await request(app)
					.post('/product/')
					.set('Authorization', userToken)
					.send(product)
			).body._id;

			//#endregion

			const expectedFields = [
				'product',
				'type',
				'publisher',
				'languages',
				'publishedIn',
				'authors',
				'compilers',
				'translators',
				'illustrators',
				'editors',
				'series',
				'copies',
				'isbns',
				'firstPublishedIn',
				'originalName',
				'font',
				'format',
				'pages',
				'weight',
				'bindingType',
				'paperType',
				'illustrationsType',
				'literaturePeriod',
				'literatureCountry',
				'foreignLiterature',
				'timePeriod',
				'suitableAge',
				'packaging',
				'occasion',
				'style',
				'suitableFor'
			];

			const newBook = {
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

			await request(app)
				.post('/book/')
				.set('Authorization', userToken)
				.send(newBook)
				.then(async response => {
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					bookId = response.body._id;

					//#region check data integrity

					await mongoose.connection
						.collection('publishers')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('authors')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('compilers')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('translators')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('illustrators')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('editors')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					await mongoose.connection
						.collection('bookseries')
						.findOne({})
						.then(result => {
							expect(
								result.books.map(id => id.toString())
							).to.include(bookId);
						});
					//#endregion
				});
		});
	});

	describe(' GET "/book/" Get all books ', () => {
		it(' Should return all books ', async () => {
			await request(app)
				.get('/book/')
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

	describe(' GET "/book/:id" Get one book ', () => {
		it(' Should return one book by id ', async () => {
			const expectedFields = [
				'product',
				'type',
				'publisher',
				'languages',
				'publishedIn',
				'authors',
				'compilers',
				'translators',
				'illustrators',
				'editors',
				'series',
				'copies',
				'isbns',
				'firstPublishedIn',
				'originalName',
				'font',
				'format',
				'pages',
				'weight',
				'bindingType',
				'paperType',
				'illustrationsType',
				'literaturePeriod',
				'literatureCountry',
				'foreignLiterature',
				'timePeriod',
				'suitableAge',
				'packaging',
				'occasion',
				'style',
				'suitableFor'
			];

			await request(app)
				.get(`/book/${bookId}`)
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

	describe(' PATCH "/book/:id" Update one existing book ', () => {
		it(' Should return book with updated data ', async () => {
			const updatedBookData = {
				publishedIn: '1982',
				languages: ['English']
			};

			await request(app)
				.patch(`/book/${bookId}`)
				.set('Authorization', userToken)
				.send(updatedBookData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body.publishedIn).to.equal(1982);
					expect(response.body.languages).to.include('English');
				});
		});
	});

	describe(' DELETE "/book/:id" Delete one book ', () => {
		it(' Should mark product as deleted via the "deletedAt" field, but not delete. ', async () => {
			await request(app)
				.delete(`/book/${bookId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedBook = await mongoose.connection
						.collection('books')
						.findOne({});
					expect(deletedBook.deletedAt).to.not.be.null;

					//#region checking all dependencies

					const author = await mongoose.connection
						.collection('authors')
						.findOne();
					expect(author.books).to.be.empty;

					const compiler = await mongoose.connection
						.collection('compilers')
						.findOne();
					expect(compiler.books).to.be.empty;

					const editor = await mongoose.connection
						.collection('editors')
						.findOne();
					expect(editor.books).to.be.empty;

					const illustrator = await mongoose.connection
						.collection('illustrators')
						.findOne();
					expect(illustrator.books).to.be.empty;

					const translator = await mongoose.connection
						.collection('translators')
						.findOne();
					expect(translator.books).to.be.empty;

					const product = await mongoose.connection
						.collection('products')
						.findOne();
					expect(product.deletedAt).to.not.be.null;

					const section = await mongoose.connection
						.collection('sections')
						.findOne();
					expect(section.products).to.be.empty;

					//#endregion
				});
		});
	});
});
