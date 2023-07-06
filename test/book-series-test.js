import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' book-series system ', () => {
	let userToken = 'Bearer ';
	let bookSeriesId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('bookseries').deleteMany();
		await mongoose.connection.collection('publishers').deleteMany();
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

	describe(' "/book-series/" POST request ', () => {
		it(' the book series data is correct; the new book series object is returned ', async () => {
			const Publisher = {
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
					.send(Publisher)
			).body._id;

			const newBookSeries = {
				name: 'Українська класика',
				publisher: publisherId,
				books: []
			};

			const expectedFields = [
				'name',
				'publisher',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/book-series/')
				.set('Authorization', userToken)
				.send(newBookSeries)
				.then(response => {
					bookSeriesId = response.body._id;

					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/book-series/" GET request ', () => {
		it(' should retrun an array of book series ', async () => {
			await request(app)
				.get('/book-series/')
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

	describe(' "/book-series/:id" GET request ', async () => {
		it(' should retrun book series object ', async () => {
			const expectedFields = [
				'name',
				'publisher',
				'books',
				'_id',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/book-series/${bookSeriesId}`)
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

	describe(' "/book-series/:id" PATCH request ', () => {
		it(' correct values are sent; updated book series object is retruned ', async () => {
			const updatedBookSeries = {
				name: 'Українська класика *updated'
			};

			await request(app)
				.patch(`/book-series/${bookSeriesId}`)
				.set('Authorization', userToken)
				.send(updatedBookSeries)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body.name).to.equal(
						'Українська класика *updated'
					);
				});
		});
	});

	describe(' "/book-series/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object cannot be obtained using a request, but it is in the database ', async () => {
			await request(app)
				.delete(`/book-series/${bookSeriesId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get arr of book series from request
					const bookSeries = (
						await request(app)
							.get('/book-series/')
							.set('Authorization', userToken)
					).body;

					// get book series object from db
					const bookSeriesObject = await mongoose.connection
						.collection('bookseries')
						.findOne(new ObjectId(bookSeriesId));

					expect(response.status).to.be.equal(204);
					expect(bookSeries).to.be.empty;
					expect(bookSeriesObject.deletedAt).to.not.be.null;
				});
		});
	});
});
