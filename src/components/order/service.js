import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { isEmptyObject, transporter } from '../../utils.js';
import Cart from '../cart/model.js';
import cartService from '../cart/service.js';
import DeliveryType from '../delivery-type/model.js';
import Product from '../product/model.js';
import User from '../user/model.js';
import userService from '../user/service.js';
import Order from './model.js';

const createOne = async orderData => {
	const { contactInfo, items } = orderData;

	try {
		Object.keys(orderData).forEach(key => {
			const isObject = typeof orderData[key] === 'object';

			if (isObject && isEmptyObject(orderData[key])) {
				delete orderData[key];
			}
		});

		if (!orderData.user) {
			const { phoneNumber, email } = contactInfo;

			const userExists = await User.where('deletedAt')
				.exists(false)
				.or([{ phoneNumber }, { email }])
				.findOne()
				.lean();

			if (userExists) {
				throw {
					status: 400,
					message: 'User exists. Authorization needed'
				};
			}

			if (!items || !items.length) {
				throw {
					status: 400,
					message: 'Order must have at least 1 item'
				};
			}

			orderData.items = await Promise.all(
				items.map(async i => {
					const existingProduct = await Product.where('_id')
						.equals(i.product)
						.where('deletedAt')
						.exists(false)
						.findOne()
						.populate({
							path: 'type',
							select: '-_id name',
							transform: type => type.name
						})
						.select('-_id name price code images')
						.transform(product => ({
							type: product.type,
							name: product.name,
							price: product.price,
							code: product.code,
							image: product.image ?? product.images[0]
						}))
						.lean();

					if (!existingProduct) {
						throw {
							status: 404,
							message: `Product with id '${i.product}' not found`
						};
					}

					return {
						product: existingProduct,
						quantity: i.quantity ?? 1
					};
				})
			);

			const password = randomBytes(8).toString('hex');

			const mailData = {
				from: '"Historium" noreply@historium.store',
				to: email,
				subject: 'Реєстрація',
				html: `Тимчасовий пароль: <b>${password}</b>`
			};

			await transporter.sendMail(mailData);

			const newUser = await userService.createOne({
				...contactInfo,
				password
			});

			orderData.user = newUser;
		} else {
			const foundCart = await Cart.where('_id')
				.equals(orderData.user.cart)
				.populate({
					path: 'items',
					populate: {
						path: 'product',
						populate: {
							path: 'type',
							select: '-_id name',
							transform: type => type.name
						},
						select: '-_id name price code images',
						transform: product => ({
							type: product.type,
							name: product.name,
							price: product.price,
							code: product.code,
							image: product.images[0]
						})
					},
					select: '-_id quantity'
				})
				.select('items')
				.findOne()
				.lean();

			orderData.items = foundCart.items;

			await cartService.clearItems(foundCart._id);
		}

		const itemsTotalPrice = orderData.items.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0
		);

		const deliveryType = await DeliveryType.where('name')
			.equals(orderData.deliveryInfo.type)
			.findOne();

		let deliveryPrice = deliveryType.price;
		const deliveryCanBeFree = deliveryType.freeDeliveryFrom;
		const suitableItemsPrice =
			itemsTotalPrice >= deliveryType.freeDeliveryFrom;

		if (deliveryCanBeFree && suitableItemsPrice) {
			deliveryPrice = 0;
		}

		orderData.totalPrice = itemsTotalPrice + deliveryPrice;

		orderData.totalQuantity = orderData.items.reduce(
			(acc, item) => acc + item.quantity,
			0
		);

		const newOrder = await Order.create(orderData);

		const mailData = {
			from: '"Historium" noreply@historium.store',
			to: contactInfo.email,
			subject: 'Замовлення',
			html: `Ваше замовлення <b>№ ${newOrder.number}</b> прийнято`
		};

		await transporter.sendMail(mailData);

		return await newOrder.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundOrder = await Order.findById(id).lean();

		if (!foundOrder) {
			throw {
				status: 404,
				message: `Order with id '${id}' not found`
			};
		}

		return foundOrder;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		return await Order.find()
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy ?? 'createdAt']: order ?? 'asc' })
			.lean();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getStatuses = async () => {
	try {
		return await mongoose.connection
			.collection('order_statuses')
			.find()
			.toArray();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateStatus = async (id, status) => {
	try {
		const orderToUpdate = await Order.where('_id')
			.equals(id)
			.findOne();

		if (!orderToUpdate) {
			throw {
				status: 404,
				message: `Order with id '${id}' not found`
			};
		}

		const foundStatus = (
			await mongoose.connection
				.collection('order_statuses')
				.find()
				.toArray()
		).find(s => s._id.toHexString() === status);

		if (!foundStatus) {
			throw {
				status: 404,
				message: `Status with id '${status}' not found`
			};
		}

		delete foundStatus._id;

		orderToUpdate.status = foundStatus;

		return await orderToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const orderToUpdate = await Order.where('_id')
			.equals(id)
			.findOne();

		if (!orderToUpdate) {
			throw {
				status: 404,
				message: `Order with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (orderToUpdate[key] = changes[key])
		);

		return await orderToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne,
	getOne,
	getAll,
	getStatuses,
	updateStatus,
	updateOne
};
