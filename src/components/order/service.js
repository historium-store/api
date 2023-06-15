import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { isEmptyObject, transporter } from '../../utils.js';
import AddressInfo from '../address-info/model.js';
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
		paymentType,
		user
	} = orderData;

	const { country, type } = deliveryInfo;

	try {
		const foundCountry = await Country.findOne({
			_id: country,
			deletedAt: { $exists: false }
		});

		if (!foundCountry) {
			throw {
				status: 404,
				message: `Country with id '${country}' not found`
			};
		}

		const foundDeliveryType = await DeliveryType.findOne({
			_id: type,
			deletedAt: { $exists: false }
		});

		if (!foundDeliveryType) {
			throw {
				status: 404,
				message: `Delivery type with id '${type}' not found`
			};
		}

		if (!foundDeliveryType.countries.includes(foundCountry.id)) {
			throw {
				status: 400,
				message: `Invalid delivery type '${foundDeliveryType.name}' for country '${foundCountry.name}'`
			};
		}

		const countryHasCities = foundCountry.cities.length;
		const existingCityProvided = foundCountry.cities.includes(
			deliveryInfo.city
		);

		if (countryHasCities && !existingCityProvided) {
			throw {
				status: 404,
				message: `City '${deliveryInfo.city}' not found in country '${foundCountry.name}'`
			};
		}

		if (!foundDeliveryType.paymentTypes.includes(paymentType)) {
			throw {
				status: 400,
				message: `Delivery type '${foundDeliveryType.name}' doesn't support payment type '${paymentType}'`
			};
		}

		if (!user) {
			const { phoneNumber, email } = contactInfo;
			const userExists = await User.exists({
				$or: [
					{ phoneNumber, deletedAt: { $exists: false } },
					{ email, deletedAt: { $exists: false } }
				]
			});

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
				subject: 'Password restoration',
				html: `Temporary password: <b>${password}</b>`
			};

			await transporter.sendMail(mailData);

			const newUser = await userService.createOne({
				...contactInfo,
				password
			});

			orderData.user = newUser._id;
		}

		orderData.contactInfo = await ContactInfo.create(contactInfo);

		if (isEmptyObject(receiverInfo)) {
			delete orderData.receiverInfo;
		} else {
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

		return await Order.create(orderData);
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
		const orderExists = await Order.exists({ _id: id });

		if (!orderExists) {
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

		return await Order.findByIdAndUpdate(
			id,
			{ $set: { status: foundStatus } },
			{ new: true }
		).populate([
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

export default {
	createOne,
	getOne,
	getAll,
	getStatuses,
	updateStatus
};
