import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import {
	isEmptyObject,
	normalizePhoneNumber,
	transporter
} from '../../utils.js';
import AddressInfo from '../address-info/model.js';
import Cart from '../cart/model.js';
import cartService from '../cart/service.js';
import CompanyInfo from '../company-info/model.js';
import ContactInfo from '../contact-info/model.js';
import Country from '../country/model.js';
import DeliveryInfo from '../delivery-info/model.js';
import DeliveryType from '../delivery-type/model.js';
import User from '../user/model.js';
import userService from '../user/service.js';
import Order from './model.js';

const createOne = async orderData => {
	const {
		contactInfo,
		receiverInfo,
		companyInfo,
		deliveryInfo,
		user
	} = orderData;

	const { country, type } = deliveryInfo;

	try {
		const foundCountry = await Country.where('_id')
			.equals(country)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundCountry) {
			throw {
				status: 404,
				message: `Country with id '${country}' not found`
			};
		}

		const foundDeliveryType = await DeliveryType.where('_id')
			.equals(type)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundDeliveryType) {
			throw {
				status: 404,
				message: `Delivery type with id '${type}' not found`
			};
		}

		let { phoneNumber, email } = contactInfo;

		if (!user) {
			phoneNumber = normalizePhoneNumber(phoneNumber);

			const userExists = await User.where('deletedAt')
				.exists(false)
				.or([{ phoneNumber }, { email }])
				.findOne();

			if (userExists) {
				throw {
					status: 409,
					message: 'User exists. Authorization needed'
				};
			}

			const password = randomBytes(8).toString('hex');

			const mailData = {
				from: '"Historium" noreply@historium.store',
				to: email,
				subject: 'Welcome to Historium',
				html: `Temporary password: <b>${password}</b>`
			};

			await transporter.sendMail(mailData);

			const { _id: id, cart } = await userService.createOne({
				...contactInfo,
				password
			});

			orderData.user = id;
			orderData.cart = cart;

			const { items } = orderData;
			delete orderData.items;

			await cartService.merge(items, cart);
		}

		const foundCart = await cartService.getByIdFromToken(
			orderData.cart
		);

		if (!foundCart.items.length) {
			throw {
				status: 400,
				message: 'Cart must have at least 1 item'
			};
		}

		delete orderData.cart;
		foundCart.items.forEach(i => delete i._id);
		Object.keys(foundCart).forEach(
			key => (orderData[key] = foundCart[key])
		);

		const foundUser = await User.where('_id')
			.equals(orderData.user)
			.where('deletedAt')
			.exists(false)
			.findOne();

		await Cart.updateOne(
			{ _id: foundUser.cart },
			{ $unset: { user: true } }
		);

		await foundUser.updateOne({
			$set: { cart: await Cart.create({ user: foundUser.id }) }
		});

		orderData.contactInfo.phoneNumber = normalizePhoneNumber(
			orderData.contactInfo.phoneNumber
		);
		orderData.contactInfo = await ContactInfo.create(contactInfo);

		if (isEmptyObject(receiverInfo)) {
			delete orderData.receiverInfo;
		} else {
			orderData.receiverInfo.phoneNumber = normalizePhoneNumber(
				orderData.receiverInfo.phoneNumber
			);
			orderData.receiverInfo = await ContactInfo.create(receiverInfo);
		}

		if (isEmptyObject(companyInfo)) {
			delete orderData.companyInfo;
		} else {
			companyInfo.addressInfo = await AddressInfo.create(
				companyInfo.addressInfo
			);

			orderData.companyInfo = await CompanyInfo.create(companyInfo);
		}

		deliveryInfo.addressInfo = await AddressInfo.create(
			deliveryInfo.addressInfo
		);

		if (deliveryInfo.contactInfo) {
			deliveryInfo.contactInfo = await ContactInfo.create(
				deliveryInfo.contactInfo
			);
		}

		orderData.deliveryInfo = await DeliveryInfo.create(deliveryInfo);

		const newOrder = await Order.create(orderData);

		//#region to delete

		const orders = await Order.find({
			number: { $exists: true }
		}).lean();

		const lastUsedNumber = Math.max(...orders.map(o => o.number), 1);

		const number =
			lastUsedNumber === 1 ? 2000134348 : lastUsedNumber + 1;

		//#endregion

		const mailData = {
			from: '"Historium" noreply@historium.store',
			to: email,
			subject: 'Замовлення',
			html: `Ваше замовлення <b>№ ${number}</b> прийнято.`
		};

		await transporter.sendMail(mailData);

		return await getOne(newOrder.id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundOrder = await Order.findById(id)
			.populate([
				{
					path: 'contactInfo',
					select: '-_id firstName lastName phoneNumber email'
				},
				{
					path: 'receiverInfo',
					select: '-_id firstName lastName phoneNumber'
				},
				{
					path: 'companyInfo',
					populate: { path: 'addressInfo', select: '-_id address' },
					select: '-_id name identificationNumber'
				},
				{
					path: 'deliveryInfo',
					populate: [
						{ path: 'country', select: '-_id name' },
						{ path: 'type', select: '-_id name price' },
						{
							path: 'addressInfo',
							select: '-_id -createdAt -updatedAt'
						},
						{
							path: 'contactInfo',
							select: '-_id firstName lastName middleName'
						}
					],
					select: '-_id city'
				},
				{
					path: 'user',
					select: 'firstName lastName phoneNumber email'
				}
			])
			.lean();

		if (!foundOrder) {
			throw {
				status: 404,
				message: `Order with id '${id}' not found`
			};
		}

		if (foundOrder.companyInfo) {
			foundOrder.companyInfo.address =
				foundOrder.companyInfo.addressInfo.address;
			delete foundOrder.companyInfo?.addressInfo;
		}

		foundOrder.deliveryInfo.country =
			foundOrder.deliveryInfo.country.name;

		return foundOrder;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip } = queryParams;

	try {
		return await Order.find()
			.limit(limit)
			.skip(skip)
			.populate([
				{
					path: 'contactInfo',
					select: '-_id firstName lastName phoneNumber email'
				},
				{
					path: 'receiverInfo',
					select: '-_id firstName lastName phoneNumber'
				},
				{
					path: 'companyInfo',
					populate: { path: 'addressInfo', select: '-_id address' },
					select: '-_id name identificationNumber'
				},
				{
					path: 'deliveryInfo',
					populate: [
						{ path: 'country', select: '-_id name' },
						{ path: 'type', select: '-_id name price' },
						{
							path: 'addressInfo',
							select: '-_id -createdAt -updatedAt'
						},
						{
							path: 'contactInfo',
							select: '-_id firstName lastName middleName'
						}
					],
					select: '-_id city'
				},
				{
					path: 'user',
					select: 'firstName lastName phoneNumber email'
				}
			]);
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

		await orderToUpdate.save();

		return await getOne(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { receiverInfo, companyInfo } = changes;

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

		if (receiverInfo) {
			const alreadySpecified = orderToUpdate.receiverInfo;

			if (alreadySpecified) {
				throw {
					status: 409,
					message: 'Order already has receiver info specified'
				};
			}

			receiverInfo.phoneNumber = normalizePhoneNumber(
				receiverInfo.phoneNumber
			);
			changes.receiverInfo = await ContactInfo.create(receiverInfo);
		}

		if (companyInfo) {
			const alreadySpecified = orderToUpdate.companyInfo;

			if (alreadySpecified) {
				throw {
					status: 409,
					message: 'Order already has company info specified'
				};
			}

			changes.companyInfo = await CompanyInfo.create(companyInfo);
		}

		Object.keys(changes).forEach(
			key => (orderToUpdate[key] = changes[key])
		);

		await orderToUpdate.save();

		return await getOne(id);
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
