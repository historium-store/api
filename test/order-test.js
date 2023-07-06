import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' Order system ', () => {
	let userToken = 'Bearer ';

	let productId;

	// adding the necessary objects to the database
	const createOtherObjects = async () => {
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

		const product = {
			name: 'Збірка українських поезій',
			type: productTypeId,
			price: 99,
			quantity: 10,
			description:
				'"Збірка українських поезій" - поетичний скарб, що втілює красу та духовність української літератури.',
			images: ['image1.png'],
			sections: [sectionId],
			code: '1023022'
		};
		productId = (
			await mongoose.connection
				.collection('products')
				.insertOne(product)
		).insertedId;
	};

	describe('  Create order ', () => {
		it(' The user does not exist. The user is created. 2 emails are sent to the email. Order is being created ', async function () {
			// Increased test execution time because emails take a long time to send
			this.timeout(10000);

			const order = {
				contactInfo: {
					firstName: 'Микола',
					lastName: 'Пшеничний',
					phoneNumber: '+380687744321',
					email: 'jorobe6702@dronetz.com'
				},
				gift: false,
				callback: true,
				deliveryInfo: {
					country: 'Україна',
					city: 'Київ',
					type: "Кур'ер Нова Пошта",
					address: 'вул. Шевченка, 10',
					contactInfo: {
						firstName: 'Микола',
						lastName: 'Пшеничний',
						middleName: 'Володимирович'
					}
				},
				paymentType: 'Готівкою або карткою: При отриманні',
				items: [{ product: productId, quantity: 3 }]
			};

			await request(app)
				.post('/order/')
				.send(order)
				.then(response => {
					console.log(response.body);
				});
		});

		it.skip(' The user exists. Displays a message asking you to log in. ', async function () {
			// Increased test execution time because emails take a long time to send
			this.timeout(10000);

			const order = {
				contactInfo: {
					firstName: 'Artem',
					lastName: 'Zhelikovskij',
					phoneNumber: '+380997846872',
					email: 'dobriy.edu@gmail.com'
				},
				gift: false,
				callback: true,
				deliveryInfo: {
					country: 'Україна',
					city: 'Київ',
					type: "Кур'ер Нова Пошта",
					address: 'вул. Шевченка, 10',
					contactInfo: {
						firstName: 'Артем',
						lastName: 'Желіківський',
						middleName: 'Володимирович'
					}
				},
				paymentType: 'Готівкою або карткою: При отриманні',
				items: [{ product: productId, quantity: 3 }]
			};

			await request(app)
				.post('/order/')
				.send(order)
				.then(response => {
					console.log(response.body);
				});
		});

		it.skip(' ы. ', async function () {
			// Increased test execution time because emails take a long time to send
			this.timeout(10000);

			const order = {
				contactInfo: {
					firstName: 'Artem',
					lastName: 'Zhelikovskij',
					phoneNumber: '+380997846872',
					email: 'dobriy.edu@gmail.com'
				},
				gift: false,
				callback: true,
				deliveryInfo: {
					country: 'Україна',
					city: 'Київ',
					type: "Кур'ер Нова Пошта",
					address: 'вул. Шевченка, 10',
					contactInfo: {
						firstName: 'Артем',
						lastName: 'Желіківський',
						middleName: 'Володимирович'
					}
				},
				paymentType: 'Готівкою або карткою: При отриманні'
			};

			await request(app)
				.post('/order/')
				.set('Authorization', userToken)
				.send(order)
				.then(response => {
					console.log(response.body);
				});
		});
	});

	before(async () => {
		await mongoose
			.connect(process.env.TEST_CONNECTION_STRING)
			.catch(err => {
				console.log(`Failed to connect to database: ${err.message}`);
			});

		createOtherObjects();
	});

	after(async () => {
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();
		await mongoose.connection.collection('countries').deleteMany();
		await mongoose.connection
			.collection('deliverytypes')
			.deleteMany();
		await mongoose.connection
			.collection('carts')
			.updateOne({}, { $set: { items: [] } });
		await mongoose.connection.collection('cartitems').deleteMany();
		mongoose.connection
			.collection('users')
			.deleteMany({ email: { $ne: 'dobriy.edu@gmail.com' } });

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
});
