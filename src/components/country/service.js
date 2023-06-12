import Country from './model.js';

const getAll = async () => {
	try {
		return (await Country.find()).map(c => c.name);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { getAll };
