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

	// TODO: создать модель BookSeries ✔
	publisherData.bookSeries = [];

	try {
		// TODO: добавить свойство bookSeries для модели издателя ✔
		return await Publisher.create(publisherData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
