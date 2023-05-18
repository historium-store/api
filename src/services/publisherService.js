import { Publisher } from '../models/index.js';

const createOne = async publisherData => {
	const exists =
		(await Publisher.findOne({ name: publisherData.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Publisher with name '${publisherData.name}' already exists`
		};
	}

	publisherData.bookSeries = [];

	try {
		return await Publisher.create(publisherData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
