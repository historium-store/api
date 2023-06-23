import validator from 'validator';
import Country from './model.js';

const getAll = async () => {
	try {
		return await Country.find()
			.lean()
			.map(c => c.name);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const isMongoId = validator.isMongoId(id);

		const foundCountry = await Country.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.findOne()
			.select('-_id name cities');

		return foundCountry;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	getAll,
	getOne
};
