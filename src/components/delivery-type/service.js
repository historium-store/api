import Country from '../country/model.js';
import DeliveryType from './model.js';

const getAll = async queryParams => {
	const { country } = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	if (country) {
		filter.countries = {
			$in: await Country.findOne({ name: country })
		};
	}

	try {
		return await DeliveryType.find(filter).select(
			'-_id -countries -createdAt -updatedAt'
		);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { getAll };
