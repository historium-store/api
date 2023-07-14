import { ObjectId } from 'bson';
import { expect } from 'chai';
import mongoose, { mongo } from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

describe(' Order system ', () => {
	const adminUser = {
		firstName: 'Артем',
		lastName: 'Желіковський',
		phoneNumber: '+380987321123',
		email: 'test.mail@gmail.com',
		password: '41424344'
	};
	let userToken = 'Bearer ';
	let productId;
	let orderId;

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
		await mongoose.connection.collection('products').deleteMany();
		await mongoose.connection.collection('producttypes').deleteMany();
		await mongoose.connection.collection('sections').deleteMany();
		await mongoose.connection.collection('countries').deleteMany();
		await mongoose.connection.collection('cartitems').deleteMany();
		await mongoose.connection.collection('orders').deleteMany();
		await mongoose.connection
			.collection('deliverytypes')
			.deleteMany();

		await mongoose.connection.collection('users').deleteMany();
		await mongoose.connection.collection('carts').deleteMany();

		await mongoose.connection.close();
	});

	describe(' POST "/order/" Create new order ', () => {
		before(async () => {
			const country = {
				name: 'Україна',
				cities: ['Одеса', 'Житомир'],
				key: 'ukraine'
			};
			const countryId = (
				await mongoose.connection
					.collection('countries')
					.insertOne(country)
			).insertedId;

			const deliveryType = {
				name: "Кур'єр Нова Пошта",
				price: 60,
				countries: [countryId],
				contactInfoRequired: false,
				fullAddressRequired: false,
				paymentTypes: [
					'Оплата карткою On-line',
					'Готівкою або карткою: При отриманні',
					'Передплата: по б/г рахунку (для юр. осіб)'
				],
				variablePrice: false,
				key: 'viddilennya-nova-poshta'
			};
			await mongoose.connection
				.collection('deliverytypes')
				.insertOne(deliveryType);

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
		});

		it(' Should register a new user and create an order. Also send 2 emails ', async function () {
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
					type: "Кур'єр Нова Пошта",
					address: 'вул. Шевченка, 10'
				},
				paymentType: 'Готівкою або карткою: При отриманні',
				items: [{ product: productId, quantity: 3 }]
			};

			await request(app)
				.post('/order/')
				.send(order)
				.then(async response => {
					expect(response.status).to.be.equal(201);

					const user = await mongoose.connection
						.collection('users')
						.findOne({ role: { $ne: 'admin' } });
					expect(user).to.not.be.null;

					const cart = await mongoose.connection
						.collection('carts')
						.findOne({ _id: user.cart });
					expect(cart).to.not.be.null;

					const order = await mongoose.connection
						.collection('orders')
						.findOne({});
					expect(order).to.not.be.null;
					expect(order.user.toString()).to.be.equal(
						user._id.toString()
					);

					orderId = order._id;
				});
		});
	});

	describe(' GET "/order/" Get all orders ', () => {
		it(' Should return all orders ', async () => {
			await request(app)
				.get('/order/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.be.an('array').and.not.be.empty;
				});
		});
	});

	describe(' GET "/order/statuses" Get all order statuses ', () => {
		it(' Should return all order statuses', async () => {
			await request(app)
				.get('/order/statuses/')
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.be.an('array').and.not.be.empty;
				});
		});
	});

	describe(' GET "/order/:id" Get one order ', () => {
		it(' Should return one order by id ', async () => {
			await request(app)
				.get(`/order/${orderId}`)
				.set('Authorization', userToken)
				.then(response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					expect(response.body).to.be.an('object').and.not.be.null;
				});
		});
	});

	describe(' PATCH "/order/status/:id" Update status of one existing order ', () => {
		it(' Should return one order by id with updated status ', async () => {
			const status = await mongoose.connection
				.collection('order_statuses')
				.findOne({ name: 'Виконаний' });

			await request(app)
				.patch(`/order/status/${orderId}`)
				.set('Authorization', userToken)
				.send({ status: status._id })
				.then(async response => {
					expect(response.status).to.equal(200);
					expect(response.header['content-type']).to.include(
						'application/json'
					);

					const order = await mongoose.connection
						.collection('orders')
						.findOne({});
					expect(order.status.name).to.be.equal('Виконаний');
				});
		});
	});
});
