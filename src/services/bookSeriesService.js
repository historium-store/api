import { BookSeries } from '../models/index.js';

const createOne = async bookSeriesData => {
	const { name, publisher } = bookSeriesData;
	const exists =
		(await BookSeries.findOne({ name, publisher })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Book series with name '${name}' & publisher '${publisher}' already exists`
		};
	}

	try {
		return await BookSeries.create(bookSeriesData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const bookSeries = await BookSeries.findById(id);

		if (!bookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return bookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await BookSeries.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { name, publisher } = changes;
	const exists =
		(await BookSeries.findOne({ name, publisher })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Book series with name '${name}' & publisher '${publisher}' already exists`
		};
	}

	try {
		const bookSeries = await BookSeries.findByIdAndUpdate(
			id,
			changes,
			{
				new: true
			}
		);

		if (!bookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return bookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const bookSeries = await BookSeries.findByIdAndDelete(id);

		if (!bookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return bookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
