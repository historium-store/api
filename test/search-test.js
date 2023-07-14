import { expect } from 'chai';
import { response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' serach system ', async () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let product1Code;

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
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe('GET "/search?q=" Search for product(s) ', () => {
		before(async () => {
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

			const product1 = {
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
			const product2 = {
				name: 'Мистецтво говорити. Таємниці ефективного спілкування',
				type: productTypeId,
				price: 80,
				quantity: 10,
				description:
					'Бізнес-тренер Джеймс Борґ, відомий своїми відкриттями в галузях спілкування, особистісного розвитку, мови тіла та «контролю мислення», пропонує прості і дієві поради для кожної людини. ',
				images: ['image2.png'],
				sections: [sectionId],
				creators: [authorName]
			};
			const product3 = {
				name: '48 законів влади',
				type: productTypeId,
				price: 99,
				quantity: 10,
				description:
					'Сорок вісім хитрих, безжальних, повчальних законів влади від Роберта Гріна, які стануть у пригоді кожному, хто прагне досягати вершин.',
				images: ['image3.png'],
				sections: [sectionId],
				creators: [authorName]
			};
			product1Code = (
				await request(app)
					.post('/product/')
					.set('Authorization', userToken)
					.send(product1)
			).body.code;
			await request(app)
				.post('/product/')
				.set('Authorization', userToken)
				.send(product2);
			await request(app)
				.post('/product/')
				.set('Authorization', userToken)
				.send(product3);
		});

		it(' Should return three poducts with entered author ', async () => {
			await request(app)
				.get(`/search?q=${'John Smith'}`)
				.then(response => {
					expect(response.status).to.be.equal(200);

					expect(response.body.result).to.not.be.empty;
					expect(response.body.total).to.be.equal(3);
				});
		});

		it(' Should return three products with an incomplete entered author ', async () => {
			await request(app)
				.get(`/search?q=${'Joh'}`)
				.then(response => {
					expect(response.status).to.be.equal(200);

					expect(response.body.result).to.not.be.empty;
					expect(response.body.total).to.be.equal(3);
				});
		});

		it(' Should return one product with entered product code ', async () => {
			await request(app)
				.get(`/search?q=${product1Code}`)
				.then(response => {
					expect(response.status).to.be.equal(200);

					expect(response.body.result).to.not.be.empty;
					expect(response.body.total).to.be.equal(1);
				});
		});

		it(' Should return one product with an incomplete entered product name ', async () => {
			await request(app)
				.get(
					`/search?q=${encodeURIComponent(
						'Мистецтво говорити. Таємниці ефективного спілкування'
					)}`
				)
				.then(response => {
					expect(response.status).to.be.equal(200);

					expect(response.body.result).to.not.be.empty;
					expect(response.body.total).to.be.equal(1);
				});
		});
	});
});
