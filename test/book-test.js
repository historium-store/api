import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' boook system ', () => {
	let userToken = 'Bearer ';
	let bookId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
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

	describe(' "/book/" POST request', async () => {
		it(' the book data is correct; the new book type object is returned ', async () => {
			const productType = {
				name: 'Книга',
				key: 'book'
			};
			const productTypeId = (
				await request(app)
					.post('/product-type/')
					.set('Authorization', userToken)
					.send(productType)
			).body._id;

			const section = {
				name: 'Фантастика',
				key: 'fantastic',
				products: [],
				sections: []
			};
			const sectionId = (
				await request(app)
					.post('/section/')
					.set('Authorization', userToken)
					.send(section)
			).body._id;

			const publisher = {
				name: 'Новий Вік',
				books: [],
				bookSeries: [],
				description:
					'Видавництво, спеціалізуючеся на публікації літератури різних жанрів',
				logo: 'https://example.com/logo.png'
			};
			const publisherId = (
				await request(app)
					.post('/publisher/')
					.set('Authorization', userToken)
					.send(publisher)
			).body._id;

			const author = {
				fullName: 'Іван Сидоренко',
				biography: 'Текст біографії автора на українській мові.',
				books: [],
				pictures: ['picture1.jpg', 'picture2.jpg']
			};
			const authorId = (
				await request(app)
					.post('/author/')
					.set('Authorization', userToken)
					.send(author)
			).body._id;

			const compiler = {
				fullName: 'Іван Бойко',
				books: []
			};
			const compilerId = (
				await request(app)
					.post('/compiler/')
					.set('Authorization', userToken)
					.send(compiler)
			).body._id;

			const translator = {
				fullName: 'Анна Мельник',
				books: []
			};
			const translatorId = (
				await request(app)
					.post('/translator/')
					.set('Authorization', userToken)
					.send(translator)
			).body._id;

			const illustrator = {
				fullName: 'Ірина Левченко',
				books: []
			};
			const illustratorId = (
				await request(app)
					.post('/illustrator/')
					.set('Authorization', userToken)
					.send(illustrator)
			).body._id;

			const editor = {
				fullName: 'Юлія Григоренко',
				books: []
			};
			const editorId = (
				await request(app)
					.post('/editor/')
					.set('Authorization', userToken)
					.send(editor)
			).body._id;

			const bookSeries = {
				name: 'Українська класика',
				publisher: publisherId,
				books: []
			};
			const bookSeriesId = (
				await request(app)
					.post('/book-series/')
					.set('Authorization', userToken)
					.send(bookSeries)
			).body._id;

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
				product: {
					name: 'Збірка українських поезій',
					type: productTypeId,
					price: 99.99,
					quantity: 10,
					description:
						'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
					images: ['image1.png'],
					sections: [sectionId]
				},
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
					bookId = response.body._id;

					await mongoose.connection.collection('');

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/book/" GET request ', () => {
		it(' should return an array of books ', async () => {
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

	describe(' "/book/:id" GET request', () => {
		it(' should return book object ', async () => {
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

	describe(' "/book/:id" PATCH request ', () => {
		it(' correct values are sent; the changed book object is returned ', async () => {
			const updatedBookData = {
				publishedIn: '1982'
			};

			await request(app)
				.patch(`/book/${bookId}`)
				.set('Authorization', userToken)
				.send(updatedBookData)
				.then(response => {
					console.log(response.body);
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
				});
		});
	});
});
