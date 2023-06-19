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
		it(' the book data is correct; the new book type object is returnd ', async () => {
			const productType = {
				name: 'Book',
				key: 'book'
			};
			const Section = {
				name: 'Fantastic',
				key: 'fantastic',
				products: [],
				sections: []
			};
			const Publisher = {
				name: 'Новий Вік',
				books: [],
				bookSeries: [],
				description:
					'Видавництво, спеціалізуючеся на публікації літератури різних жанрів',
				logo: 'https://example.com/logo.png'
			};
			const Author = {
				fullName: 'Іван Сидоренко',
				biography: 'Текст біографії автора на українській мові.',
				books: [],
				pictures: ['picture1.jpg', 'picture2.jpg']
			};
			const Compiler = {
				fullName: 'Іван Бойко',
				books: []
			};
			const Translator = {
				fullName: 'Анна Мельник',
				books: []
			};
			const Illustrator = {
				fullName: 'Ірина Левченко',
				books: []
			};
			const Editor = {
				fullName: 'Юлія Григоренко',
				books: []
			};
		});
	});
});
