import { isEmptyObject } from '../../utils.js';
import AddressInfo from '../address-info/model.js';
import CompanyInfo from '../company-info/model.js';
import ContactInfo from '../contact-info/model.js';
import Country from '../country/model.js';
import DeliveryInfo from '../delivery-info/model.js';
import DeliveryType from '../delivery-type/model.js';
import Order from './model.js';

const createOne = async orderData => {
	const {
		contactInfo,
		receiverInfo,
		companyInfo,
		deliveryInfo,
		paymentType
	} = orderData;

	try {
		const foundCountry = await Country.findOne({
			_id: deliveryInfo.country,
			deletedAt: { $exists: false }
		});

		if (!foundCountry) {
			throw {
				status: 404,
				message: `Country with id '${deliveryInfo.country}' not found`
			};
		}

		const foundDeliveryType = await DeliveryType.findOne({
			_id: deliveryInfo.type,
			deletedAt: { $exists: false }
		});

		if (!foundDeliveryType) {
			throw {
				status: 404,
				message: `Delivery type with id '${deliveryInfo.type}' not found`
			};
		}

		if (!foundDeliveryType.countries.includes(foundCountry.id)) {
			throw {
				status: 400,
				message: `Invalid delivery type '${foundDeliveryType.name}' for country '${foundCountry.name}'`
			};
		}

		const countryHasCities = foundCountry.cities.length;
		const countryHasCity = foundCountry.cities.includes(
			deliveryInfo.city
		);

		if (countryHasCities && !countryHasCity) {
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

		const companyInfoProvided = !isEmptyObject(companyInfo);

		if (companyInfoProvided) {
			companyInfo.addressInfo = (
				await AddressInfo.create(companyInfo.addressInfo)
			).id;
		} else {
			delete orderData.companyInfo;
		}

		deliveryInfo.addressInfo = (
			await AddressInfo.create(deliveryInfo.addressInfo)
		).id;

		if (deliveryInfo.contactInfo) {
			deliveryInfo.contactInfo = (
				await ContactInfo.create(deliveryInfo.contactInfo)
			).id;
		}

		orderData.contactInfo = (
			await ContactInfo.create(contactInfo)
		).id;

		if (!isEmptyObject(receiverInfo)) {
			orderData.receiverInfo = (
				await ContactInfo.create(receiverInfo)
			).id;
		}

		if (companyInfoProvided) {
			orderData.companyInfo = (
				await CompanyInfo.create(companyInfo)
			).id;
		}

		orderData.deliveryInfo = (
			await DeliveryInfo.create(deliveryInfo)
		).id;

		return await Order.create(orderData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
