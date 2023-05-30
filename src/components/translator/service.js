import Book from '../book/model.js';
import Translator from './model.js';

const createOne = async translatorData => {
	let { fullName, books } = translatorData;
	books = books ?? [];

	try {
		const existingTranslator = await Translator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingTranslator) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		const notFoundIndex = (
			await Book.find({
				_id: books
			})
		).findIndex(b => !b || b.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Book with id '${books[notFoundIndex]}' not found`
			};
		}

		const newTranslator = await Translator.create(translatorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { translators: newTranslator.id } }
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
		const foundTranslator = await Translator.findById(id);

		if (!foundTranslator || foundTranslator.deletedAt) {
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
	const { limit, offset: skip } = queryParams;

	try {
		const filter = {
			deletedAt: { $exists: false }
		};

		return await Translator.find(filter).limit(limit).skip(skip);
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
		const translatorToUpdate = await Translator.findById(id);

		if (!translatorToUpdate || translatorToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		const existingTranslator = await Translator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (
			existingTranslator &&
			existingTranslato._id.toHexString() !== id
		) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b || b.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Book with id '${books[notFoundIndex]}' not found`
				};
			}

			const oldBookIds = translatorToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { translators: translatorToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { translators: translatorToUpdate.id } }
			);
		}

		await translatorToUpdate.updateOne(changes);

		return await Translator.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const translatorToDelete = await Translator.findById(id);

		if (!translatorToDelete || translatorToDelete.deletedAt) {
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

		return translatorToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
