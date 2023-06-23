import DeliveryType from './model.js';

const getAll = async () => {
	try {
		return await DeliveryType.find().select(
			'-countries -createdAt -updatedAt -variablePrice'
		);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	getAll
};
