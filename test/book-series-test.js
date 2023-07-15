import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' book-series system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let bookSeriesId;

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
		await mongoose.connection.collection('bookseries').deleteMany();
		await mongoose.connection.collection('publishers').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/book-series/" Create new book series ', () => {
		it(' Should create new book series in database ', async () => {
			//#region adding the necessary objects to the database

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

			//#endregion

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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					bookSeriesId = response.body._id;
				});
		});
	});

	describe(' GET "/book-series/" Get all book series ', () => {
		it(' Should return all book series ', async () => {
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

	describe(' GET "/book-series/:id" Get one book series ', async () => {
		it(' Should return one book series by id ', async () => {
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

	describe(' PATCH "/book-series/:id" Update one existing book series ', () => {
		it(' Should return one book series with updated data ', async () => {
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

	describe(' DELETE "/book-series/:id" Delete one book series ', () => {
		it(' Should mark book series as deleted via the "deletedAt" field, but not delete ', async () => {
			await request(app)
				.delete(`/book-series/${bookSeriesId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const deletedBookSeries = await mongoose.connection
						.collection('bookseries')
						.findOne({});
					expect(deletedBookSeries.deletedAt).to.not.be.null;

					const publisher = await mongoose.connection
						.collection('publishers')
						.findOne({});
					expect(publisher.bookSeries).to.be.empty;
				});
		});
	});
});
