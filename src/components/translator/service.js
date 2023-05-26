import Book from '../book/model.js';
import Translator from './model.js';

const createOne = async translatorData => {
	let { fullName, books } = translatorData;
	books = books ?? [];

	try {
		if (await Translator.exists({ fullName })) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		const notFoundIndex = (await Book.find({ _id: books })).findIndex(
			b => !b
		);
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

		return await Translator.findById(newTranslator.id).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		if (!(await Translator.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		return Translator.findById(id).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Translator.find().populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
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

		if (!translatorToUpdate) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		if (await Translator.exists({ fullName })) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b);
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

		return await Translator.findByIdAndUpdate(id, changes, {
			new: true
		}).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
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

		return translatorToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
