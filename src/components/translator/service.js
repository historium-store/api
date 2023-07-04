import Book from '../book/model.js';
import Translator from './model.js';

const createOne = async translatorData => {
	let { fullName } = translatorData;

	try {
		const translatorExists = await Translator.where('fullName')
			.equals(fullName)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (translatorExists) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		return await Translator.create(translatorData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundTranslator = await Translator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundTranslator) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		return foundTranslator;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		return await Translator.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { fullName } = changes;

	try {
		const translatorToUpdate = await Translator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!translatorToUpdate) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		if (fullName) {
			const translatorExists = await Translator.where('fullName')
				.equals(fullName)
				.where('deletedAt')
				.exists(false)
				.findOne();

			if (translatorExists) {
				throw {
					status: 409,
					message: `Translator with full name '${fullName}' already exists`
				};
			}
		}

		Object.keys(changes).forEach(key => {
			translatorToUpdate[key] = changes[key];
		});

		return await translatorToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const translatorToDelete = await Translator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!translatorToDelete) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: translatorToDelete.books },
			{ $pull: { translators: translatorToDelete.id } }
		);

		await translatorToDelete.deleteOne();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};
