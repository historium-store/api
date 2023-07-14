import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' author system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let authorId;

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
		await mongoose.connection.collection('authors').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/author/" Create new author ', () => {
		it(' Shoud create new author in database ', async () => {
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
					expect(response.status).to.equal(201);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.include.keys(...expectedFields);

					authorId = response.body._id;
				});
		});
	});

	describe(' GET "/author/" Get all authors ', () => {
		it(' Should return all authors ', async () => {
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

	describe(' GET "/author/:id" Get one author ', () => {
		it(' Should return one author by id ', async () => {
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

	describe(' PATCH "/author/:id" Update one existing author ', () => {
		it(' Should return one author with updated data ', async () => {
			const updatedAuthorData = {
				fullName: "Ім'ян Прізвиськов",
				pictures: ['url-to-new-picture', 'url-to-another-new-picture']
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
						"Ім'ян Прізвиськов"
					);
					expect(response.body.pictures).to.includes(
						'url-to-new-picture',
						'url-to-another-new-picture'
					);
				});
		});
	});

	describe(' DELETE "/author/:id" Delete one author ', () => {
		it(' Should mark author as deleted via the "deletedAt" field, but not delete. ', async () => {
			await request(app)
				.delete(`/author/${authorId}`)
				.set('Authorization', userToken)
				.then(async response => {
					expect(response.status).to.be.equal(204);

					const author = await mongoose.connection
						.collection('authors')
						.findOne({});
					expect(author.deletedAt).to.not.be.null;
				});
		});
	});
});
