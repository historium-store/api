import ContactInfo from '../contact-info/model.js';
import Country from '../country/model.js';
import DeliveryType from '../delivery-type/model.js';
import DeliveryInfo from './model.js';

const updateOne = async (id, changes) => {
	const { country, type, contactInfo } = changes;

	try {
		const foundDeliveryInfo = await DeliveryInfo.findOne({
			_id: id
		});

		if (!foundDeliveryInfo) {
			throw {
				status: 404,
				message: `Delivery info with id '${id}' not found`
			};
		}

		if (country && !type) {
			const newCountry = await Country.findOne({ _id: country });

			if (!newCountry) {
				throw {
					status: 404,
					message: `Country with id '${country}' not found`
				};
			}

			await foundDeliveryInfo.populate('type');
			const type = foundDeliveryInfo.type;

			if (!type.countries.includes(newCountry.id)) {
				throw {
					status: 400,
					message: `Invalid delivery type '${type.name}' for country '${newCountry.name}'`
				};
			}
		} else if (!country && type) {
			const newDeliveryType = await DeliveryType.findOne({
				_id: type
			});

			if (!newDeliveryType) {
				throw {
					status: 404,
					message: `Delivery type with id '${type}' not found`
				};
			}

			await foundDeliveryInfo.populate('country');
			const country = foundDeliveryInfo.country;

			if (!newDeliveryType.countries.includes(country.id)) {
				throw {
					status: 400,
					message: `Invalid delivery type '${newDeliveryType.name}' for country '${country.name}'`
				};
			}
		} else if (country && type) {
			const newCountry = await Country.findOne({ _id: country });

			if (!newCountry) {
				throw {
					status: 404,
					message: `Country with id '${country}' not found`
				};
			}

			const newDeliveryType = await DeliveryType.findOne({
				_id: type
			});

			if (!newDeliveryType) {
				throw {
					status: 404,
					message: `Delivery type with id '${type}' not found`
				};
			}

			if (!newDeliveryType.countries.includes(newCountry.id)) {
				throw {
					status: 400,
					message: `Invalid delivery type '${newDeliveryType.name}' for country '${newCountry.name}'`
				};
			}
		}

		if (contactInfo) {
			const exists = await ContactInfo.exists({ _id: contactInfo });

			if (!exists) {
				throw {
					status: 404,
					message: `Contact info with id '${contactInfo}' not found`
				};
			}
		}

		return await DeliveryInfo.findByIdAndUpdate(id, changes, {
			new: true
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	updateOne
};
