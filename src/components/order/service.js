import { randomBytes } from 'crypto';
import { isEmptyObject, transporter } from '../../utils.js';
import AddressInfo from '../address-info/model.js';
import CompanyInfo from '../company-info/model.js';
import ContactInfo from '../contact-info/model.js';
import Country from '../country/model.js';
import DeliveryInfo from '../delivery-info/model.js';
import DeliveryType from '../delivery-type/model.js';
import User from '../user/model.js';
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

			orderData.user = await User.create({ ...contactInfo });
		}

		return await Order.create(orderData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
