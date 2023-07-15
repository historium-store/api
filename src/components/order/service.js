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
				.select('_id')
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
					const foundProduct = await Product.where('_id')
						.equals(i.product)
						.where('deletedAt')
						.exists(false)
						.populate({
							path: 'type',
							select: '-_id name key'
						})
						.select(
							'name creators key price quantity createdAt code images requiresDelivery'
						)
						.transform(product => ({
							...product,
							image: product.image ?? product.images[0],
							images: undefined
						}))
						.findOne()
						.lean();

					if (!foundProduct) {
						throw {
							status: 404,
							message: `Product with id '${i.product}' not found`
						};
					}

					if (foundProduct.quantity && foundProduct.quantity == 0) {
						throw {
							status: 400,
							message: `Product '${i.product}' is out of stock`
						};
					}

					return {
						product: foundProduct,
						quantity: i.quantity ?? 1
					};
				})
			);

			const password = randomBytes(8).toString('hex');

			const newUser = await userService.createOne({
				...contactInfo,
				password
			});

			const mailData = {
				from: '"Historium" noreply@historium.store',
				to: email,
				subject: 'Реєстрація',
				html: `Тимчасовий пароль: <b>${password}</b>`
			};

			await transporter.sendMail(mailData);

			orderData.user = newUser.id;
		} else {
			const foundCart = await Cart.where('_id')
				.equals(orderData.user.cart)
				.populate({
					path: 'items',
					populate: {
						path: 'product',
						populate: {
							path: 'type',
							select: '-_id name key'
						},
						select:
							'name creators key price quantity createdAt code images requiresDelivery',
						transform: product => ({
							...product,
							image: product.image ?? product.images[0],
							images: undefined
						})
					},
					select: '-_id quantity'
				})
				.select('items')
				.transform(cart => ({ ...cart, id: cart._id }))
				.findOne()
				.lean();

			if (!foundCart.items.length) {
				throw {
					status: 400,
					message: 'Order must have at least 1 item'
				};
			}

			for (let item of foundCart.items) {
				if (
					item.product.quantity !== undefined &&
					item.product.quantity == 0
				) {
					throw {
						status: 400,
						message: `Product '${item.product._id}' is out of stock`
					};
				}
			}

			orderData.items = foundCart.items;

			await cartService.clearItems(foundCart.id ?? foundCart._id);
		}

		const itemsTotalPrice = orderData.items.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0
		);

		orderData.deliveryPrice = 0;

		if (orderData.deliveryInfo) {
			const deliveryType = await DeliveryType.where('name')
				.equals(deliveryInfo.type)
				.select('-_id price freeDeliveryFrom')
				.findOne()
				.lean();

			if (!deliveryType) {
				throw {
					status: 404,
					message: `Delivery type '${deliveryInfo.type}' not found`
				};
			}

			const deliveryCanBeFree = deliveryType.freeDeliveryFrom;
			const suitableItemsPrice =
				itemsTotalPrice >= deliveryType.freeDeliveryFrom;

			if (!deliveryCanBeFree || !suitableItemsPrice) {
				orderData.deliveryPrice = deliveryType.price;
			}
		}

		orderData.totalPrice = itemsTotalPrice + orderData.deliveryPrice;

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

		return newOrder;
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
			.sort({ [orderBy ?? 'createdAt']: order ?? 'desc' })
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

		console.log(foundStatus);

		if (!foundStatus) {
			throw {
				status: 404,
				message: `Status with id '${status}' not found`
			};
		}

		if (foundStatus.key === 'accepted') {
			await Promise.all(
				orderToUpdate.items.map(async item => {
					const productToUpdate = await Product.where('_id')
						.equals(item.product._id)
						.where('deletedAt')
						.exists(false)
						.select('quantity')
						.findOne();

					if (!productToUpdate) {
						throw {
							status: 404,
							message: `Product with id '${item.product._id}' not found`
						};
					}

					if (productToUpdate.quantity !== undefined) {
						const enoughProduct =
							productToUpdate.quantity - item.quantity > -1;

						if (!enoughProduct) {
							throw {
								status: 400,
								message: `Not enough product in stock with id '${item.product._id}'`
							};
						}

						await productToUpdate.updateOne({
							$inc: { quantity: -item.quantity }
						});
					}
				})
			);
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
	const { status } = changes;

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

		if (status) {
			changes.status = (await updateStatus(id, status)).status;
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
