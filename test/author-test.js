import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' author system ', () => {
	let userToken = 'Bearer ';
	let authorId;

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTIONG_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});
	});

	after(async () => {
		await mongoose.connection.collection('authors').deleteMany();
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

	describe(' "/author/" POST request ', () => {
		it(' the author data is correct; the new author object is returned ', async () => {
			const newAuthor = {
				fullName: 'John Smith',
				biography:
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				books: [],
				pictures: ['picture1.jpg', 'picture2.jpg']
			};

			const expectedFields = [
				'fullName',
				'biography',
				'books',
				'_id',
				'pictures',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.post('/author/')
				.set('Authorization', userToken)
				.send(newAuthor)
				.then(response => {
					authorId = response.body._id;
					console.log(response.body.message);
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});

	describe(' "/author/" GET request ', () => {
		it(' should return an array of authors ', async () => {
			await request(app)
				.get('/author/')
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

	describe(' "/author/:id" GET request ', () => {
		it(' should return author object', async () => {
			const expectedFields = [
				'fullName',
				'biography',
				'books',
				'_id',
				'pictures',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.get(`/author/${authorId}`)
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

	describe(' "/author/:id" PATCH request ', () => {
		it(' correct values are sent; the changed author object is returned ', async () => {
			const updatedAuthorData = {
				fullName: 'Updated author name',
				biography:
					'Updated author biography, which contain 40 symbols.'
			};
			const expectedFields = [
				'fullName',
				'biography',
				'books',
				'_id',
				'pictures',
				'createdAt',
				'updatedAt'
			];

			await request(app)
				.patch(`/author/${authorId}`)
				.set('Authorization', userToken)
				.send(updatedAuthorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body).to.include.keys(...expectedFields);
				});
		});
	});
});
