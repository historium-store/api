import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' author system ', () => {
	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
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

	let userToken = 'Bearer ';
	let authorId;

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
				fullName: 'Updated author name'
			};

			await request(app)
				.patch(`/author/${authorId}`)
				.set('Authorization', userToken)
				.send(updatedAuthorData)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);
					expect(response.body.fullName).to.equal(
						'Updated author name'
					);
				});
		});
	});

	describe(' "/author/:id" DELETE request ', () => {
		it(' should set the "deletedAt" field. the object cannot be obtained using a request, but it is in the database ', async () => {
			await request(app)
				.delete(`/author/${authorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					// get arr of authors from request
					const authors = (
						await request(app)
							.get('/author/')
							.set('Authorization', userToken)
					).body;

					// get author object from db
					const authorObject = await mongoose.connection
						.collection('authors')
						.findOne(new ObjectId(authorId));

					expect(response.status).to.be.equal(204);
					expect(authors).to.be.empty;
					expect(authorObject.deletedAt).to.not.be.null;
				});
		});
	});
});
