import Book from '../book/model.js';
import Translator from './model.js';

const checkTranslatorExistense = async fullName => {
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
};

const createOne = async translatorData => {
	let { fullName, books } = translatorData;
	books = books ?? [];

	try {
		await checkTranslatorExistense(fullName);

		await Promise.all(
			books.map(async id => {
				const existingBook = await Book.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingBook) {
					throw {
						status: 404,
						message: `Book with id '${id}' not found`
					};
				}
			})
		);

		const newTranslator = await Translator.create(translatorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { translators: newTranslator } }
		);

		return newTranslator;
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
	const { fullName, books } = changes;

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
			await checkTranslatorExistense(fullName);
		}

		if (books) {
			await Promise.all(
				books.map(async id => {
					const existingBook = await Book.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.findOne();

					if (!existingBook) {
						throw {
							status: 404,
							message: `Book with id '${id}' not found`
						};
					}
				})
			);

			const oldBookIds = translatorToUpdate.books.map(b =>
				b.toHexString()
			);
			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);

			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { translators: translatorToUpdate.id } }
			);

			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { translators: translatorToUpdate.id } }
			);
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
