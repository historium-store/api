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

const getOne = async id => {
	try {
		const publisher = await Publisher.findById(id);

		if (!publisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return publisher;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Publisher.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const exists =
		(await Publisher.findOne({ name: changes.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Publisher with name '${changes.name}' already exists`
		};
	}

	try {
		const publisher = await Publisher.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!publisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return publisher;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const publisher = await Publisher.findByIdAndDelete(id);

		if (!publisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return publisher;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
