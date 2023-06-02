import Book from '../book/model.js';
import Translator from './model.js';

const createOne = async translatorData => {
	// деструктуризация входных данных
	// для более удобного использования
	let { fullName, books } = translatorData;
	books = books ?? [];

	try {
		// проверка существования переводчика
		// с входным полным именем
		const translatorExists = await Translator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (translatorExists) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		// проверка существования
		// входных книг переводчика
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

		// добавление ссылки на нового переводчика
		// соответствующим книгам
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
		// проверка существования переводчика
		// с входным id
		const foundTranslator = await Translator.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

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
	// деструктуризация входных данных
	// для более удобного использования
	const { limit, offset: skip } = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		return await Translator.find(filter).limit(limit).skip(skip);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	// деструктуризация входных данных
	// для более удобного использования
	const { fullName, books } = changes;

	try {
		// проверка существования переводчика
		// с входным id
		const translatorToUpdate = await Translator.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!translatorToUpdate) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		// проверка существования переводчика
		// с входным полным именем
		const translatorExists = await Translator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (translatorExists) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		// проверка существования
		// входных книг
		// если они есть в изменениях
		// обновление соответствующих книг
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
		// проверка существования переводчика
		// с входным id
		const translatorToDelete = await Translator.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!translatorToDelete) {
			throw {
				status: 404,
				message: `Translator with id '${id}' not found`
			};
		}

		// удаление ссылки на переводчика
		// в соответствующих книгах
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
