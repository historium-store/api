import validator from 'validator';

import productService from '../product/service.js';

import Author from '../author/model.js';
import BookSeries from '../book-series/model.js';
import Compiler from '../compiler/model.js';
import Editor from '../editor/model.js';
import Illustrator from '../illustrator/model.js';
import Product from '../product/model.js';
import Publisher from '../publisher/model.js';
import Translator from '../translator/model.js';
import Book from './model.js';

const createOne = async bookData => {
	// деструктуризация входных данных
	// для более удобного использования
	let {
		publisher,
		authors,
		compilers,
		translators,
		illustrators,
		editors,
		series
	} = bookData;
	authors = authors ?? [];
	compilers = compilers ?? [];
	translators = translators ?? [];
	illustrators = illustrators ?? [];
	editors = editors ?? [];

	try {
		// проверка существования
		// входного издателя книги
		const publisherExists = await Publisher.exists({
			_id: publisher,
			deletedAt: { $exists: false }
		});

		if (!publisherExists) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		// проверка существования
		// входных авторов книги
		let notFoundIndex = (
			await Author.find({
				_id: authors
			})
		).findIndex(a => !a || a.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Author with id '${authors[notFoundIndex]}' not found`
			};
		}

		// проверка существования
		// входных составителей книги
		notFoundIndex = (
			await Compiler.find({
				_id: compilers
			})
		).findIndex(c => !c || c.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Compiler with id '${compilers[notFoundIndex]}' not found`
			};
		}

		// проверка существования
		// входных переводчиков книги
		notFoundIndex = (
			await Translator.find({
				_id: translators
			})
		).findIndex(t => !t || t.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Translator with id '${translators[notFoundIndex]}' not found`
			};
		}

		// проверка существования
		// входных иллюстраторов книги
		notFoundIndex = (
			await Illustrator.find({
				_id: illustrators
			})
		).findIndex(i => !i || i.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Illustrator with id '${illustrators[notFoundIndex]}' not found`
			};
		}

		// проверка существования
		// входных редакторов книги
		notFoundIndex = (
			await Editor.find({
				_id: editors
			})
		).findIndex(e => !e || e.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Editor with id '${editors[notFoundIndex]}' not found`
			};
		}

		// проверка существования
		// входной серии книг
		if (series) {
			const bookSeriesExists = await BookSeries.exists({
				_id: series,
				deletedAt: { $exists: false }
			});

			if (!bookSeriesExists) {
				throw {
					status: 404,
					message: `Book series with id '${series}' not found`
				};
			}
		}

		// создание продукта
		// и привязка его id
		// к входным данным книги
		const newProduct = await productService.createOne({
			...bookData.product
		});
		bookData.product = newProduct.id;

		// создание книги
		// и привязка её id
		// к созданному продукту
		const newBook = await Book.create(bookData);
		await newProduct.updateOne({
			specificProduct: newBook.id
		});

		// добавление ссылки на новую книгу
		// соответствующему издателю
		await Publisher.updateOne(
			{ _id: publisher },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим авторам
		await Author.updateMany(
			{ _id: authors },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим составителям
		await Compiler.updateMany(
			{ _id: compilers },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим переводчикам
		await Translator.updateMany(
			{ _id: translators },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим иллюстраторам
		await Illustrator.updateMany(
			{ _id: illustrators },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим редакторам
		await Editor.updateMany(
			{ _id: editors },
			{ $addToSet: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующей серии книг
		await BookSeries.updateOne(
			{ _id: series },
			{ $addToSet: { books: newBook.id } }
		);

		return newBook;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const isMongoId = validator.isMongoId(id);

		let filter = { deletedAt: { $exists: false } };

		if (isMongoId) {
			filter._id = id;
		} else {
			const foundProduct = await Product.exists({ key: id });

			filter.product = foundProduct._id;
		}

		// проверка существования книги
		// с входным id,
		// заполнение необходимых полей
		const foundBook = await Book.findOne(filter).populate([
			{
				path: 'product',
				populate: [
					{ path: 'type', select: 'name key' },
					{ path: 'sections', select: 'name key' }
				],
				select: '-specificProduct'
			},
			{ path: 'publisher', select: 'name' },
			{
				path: 'authors',
				select: 'fullName pictures biography'
			},
			{ path: 'compilers', select: 'fullName' },
			{ path: 'translators', select: 'fullName' },
			{ path: 'illustrators', select: 'fullName' },
			{ path: 'editors', select: 'fullName' },
			{ path: 'series', select: 'name' }
		]);

		if (!foundBook) {
			throw {
				status: 404,
				message: `Book with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		return foundBook;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const {
		limit,
		offset: skip,
		orderBy,
		order,
		bookType: type,
		publisher,
		language,
		author,
		price
	} = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	if (type) {
		filter.type = type;
	}

	if (publisher) {
		const foundPublishers = await Publisher.find({
			name: publisher,
			deletedAt: { $exists: false }
		});

		filter.publisher = foundPublishers.map(p => p.id);
	}

	if (language) {
		filter.languages = language;
	}

	if (author) {
		const foundAuthors = await Author.find({
			fullName: author,
			deletedAt: { $exists: false }
		});

		filter.authors = foundAuthors.map(p => p.id);
	}

	if (price) {
		const foundProducts = await Product.find({
			price: { $gte: price[0], $lte: price[1] }
		});

		filter.product = foundProducts.map(p => p.id);
	}

	try {
		const foundBooks = await Book.find(filter)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.populate([
				{
					path: 'product',
					populate: [{ path: 'type', select: '-_id name key' }],
					select: '-_id name key price quantity code images'
				},
				{ path: 'authors', select: '-_id fullName' }
			])
			.select('authors');

		const booksToReturn = [];

		for (let book of foundBooks) {
			book = book.toObject();
			book.image = book.product.images[0];
			delete book.product.images;
			book.authors = book.authors.map(a => a.fullName);
			booksToReturn.push(book);
		}

		return {
			result: booksToReturn,
			total: await Book.countDocuments()
		};
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const {
		product,
		publisher,
		authors,
		compilers,
		translators,
		illustrators,
		editors,
		series
	} = changes;

	try {
		// проверка существования книги
		// с входным id
		const bookToUpdate = await Book.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!bookToUpdate) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		// обновление продукта
		// если он был изменён
		if (product) {
			await productService.updateOne(bookToUpdate.product, product);

			delete changes.product;
		}

		// проверка существования
		// входного издателя
		// если он был изменён
		let oldPublisher;
		let newPublisher;
		if (publisher) {
			newPublisher = await Publisher.findById(publisher);
			if (!newPublisher || newPublisher.deletedAt) {
				throw {
					status: 404,
					message: `Publisher with id '${publisher}' not found`
				};
			}

			oldPublisher = await Publisher.findById(bookToUpdate.publisher);
		}

		// проверка существования
		// входной серии книг
		// если она была изменена
		let oldBookSeries;
		let newBookSeries;
		if (series) {
			newBookSeries = await BookSeries.findById(series);

			if (!newBookSeries || newBookSeries.deletedAt) {
				throw {
					status: 404,
					message: `Book series with id '${series}' not found`
				};
			}

			oldBookSeries = await BookSeries.findById(bookToUpdate.series);
		}

		// проверка существования
		// входных авторов
		// если они были изменены
		const addedAuthorIds = [];
		const removedAuthorIds = [];
		if (authors) {
			const notFoundIndex = (
				await Author.find({ _id: authors })
			).findIndex(a => !a || a.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Author with id '${authors[notFoundIndex]}' not found`
				};
			}

			const oldAuthorIds = bookToUpdate.authors.map(a =>
				a.id.toString('hex')
			);

			addedAuthorIds.push(
				...authors.filter(a => !oldAuthorIds.includes(a))
			);
			removedAuthorIds.push(
				...oldAuthorIds.filter(a => !authors.includes(a))
			);
		}

		// проверка существования
		// входных составителей
		// если они были изменены
		const addedCompilerIds = [];
		const removedCompilerIds = [];
		if (compilers) {
			const notFoundIndex = (
				await Compiler.find({ _id: compilers })
			).findIndex(c => !c || c.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Compiler with id '${compilers[notFoundIndex]}' not found`
				};
			}

			const oldCompilerIds = bookToUpdate.compilers.map(c =>
				c.id.toString('hex')
			);

			addedCompilerIds.push(
				...compilers.filter(c => !oldCompilerIds.includes(c))
			);
			removedCompilerIds.push(
				...oldCompilerIds.filter(c => !compilers.includes(c))
			);
		}

		// проверка существования
		// входных переводчиков
		// если они были изменены
		const addedTranslatorIds = [];
		const removedTranslatorIds = [];
		if (translators) {
			const notFoundIndex = (
				await Translator.find({ _id: translators })
			).findIndex(t => !t || t.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Translator with id '${translators[notFoundIndex]}' not found`
				};
			}

			const oldTranslatorIds = bookToUpdate.translators.map(t =>
				t.id.toString('hex')
			);

			addedTranslatorIds.push(
				...translators.filter(c => !oldTranslatorIds.includes(c))
			);
			removedTranslatorIds.push(
				...oldTranslatorIds.filter(c => !translators.includes(c))
			);
		}

		// проверка существования
		// входных иллюстраторов
		// если они были изменены
		const addedIllustratorIds = [];
		const removedIllustratorIds = [];
		if (illustrators) {
			const notFoundIndex = (
				await Illustrator.find({ _id: illustrators })
			).findIndex(i => !i || i.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Illustrator with id '${illustrators[notFoundIndex]}' not found`
				};
			}

			const oldIllustratorIds = bookToUpdate.illustrators.map(t =>
				t.id.toString('hex')
			);

			addedIllustratorIds.push(
				...illustrators.filter(c => !oldIllustratorIds.includes(c))
			);
			removedIllustratorIds.push(
				...oldIllustratorIds.filter(c => !illustrators.includes(c))
			);
		}

		// проверка существования
		// входных редакторов
		// если они были изменены
		const addedEditorIds = [];
		const removedEditorIds = [];
		if (editors) {
			const notFoundIndex = (
				await Editor.find({ _id: editors })
			).findIndex(e => !e || e.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Editor with id '${editors[notFoundIndex]}' not found`
				};
			}

			const oldEditorIds = bookToUpdate.editors.map(t =>
				t.id.toString('hex')
			);

			addedEditorIds.push(
				...editors.filter(c => !oldEditorIds.includes(c))
			);
			removedEditorIds.push(
				...oldEditorIds.filter(c => !editors.includes(c))
			);
		}

		// обновление соответствуюших издателей
		// при их наличии в изменениях и различии
		const samePublisher = newPublisher.id === oldPublisher.id;
		if (publisher && !samePublisher) {
			await newPublisher.updateOne({
				$addToSet: { books: bookToUpdate.id }
			});
			await oldPublisher.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		// обновление соответствуюших серий книг
		// при их наличии в изменениях и различии
		const sameBookSeries = newBookSeries.id !== oldBookSeries.id;
		if (series && !sameBookSeries) {
			await newBookSeries.updateOne({
				$addToSet: { books: bookToUpdate.id }
			});
			await oldBookSeries.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		// обновление соответствующих
		// авторов книги
		await Author.updateMany(
			{ _id: addedAuthorIds },
			{ $addToSet: { books: bookToUpdate.id } }
		);
		await Author.updateMany(
			{ _id: removedAuthorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		// обновление соответствующих
		// составителей книги
		await Compiler.updateMany(
			{ _id: addedCompilerIds },
			{ $addToSet: { books: bookToUpdate.id } }
		);
		await Compiler.updateMany(
			{ _id: removedCompilerIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		// обновление соответствующих
		// переводчиков книги
		await Translator.updateMany(
			{ _id: addedTranslatorIds },
			{ $addToSet: { books: bookToUpdate.id } }
		);
		await Translator.updateMany(
			{ _id: addedTranslatorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		// обновление соответствующих
		// иллюстраторов книги
		await Illustrator.updateMany(
			{ _id: addedIllustratorIds },
			{ $addToSet: { books: bookToUpdate.id } }
		);
		await Illustrator.updateMany(
			{ _id: addedIllustratorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		// обновление соответствующих
		// редакторов книги
		await Editor.updateMany(
			{ _id: addedEditorIds },
			{ $addToSet: { books: bookToUpdate.id } }
		);
		await Editor.updateMany(
			{ _id: addedEditorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		await bookToUpdate.updateOne(changes);

		return await Book.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		// проверка существования
		// книги с входным id
		const bookToDelete = await Book.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!bookToDelete) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		// удаление ссылки на книгу
		// у соответствующего издателя
		await Publisher.updateOne(
			{ _id: bookToDelete.publisher },
			{ $pull: { books: bookToDelete.id } }
		);

		// удаления связанного
		// с книгой продукта
		await productService.deleteOne(bookToDelete.product);

		// удаление ссылки на книгу
		// у соответствующей серии книг
		await BookSeries.updateOne(
			{ _id: bookToDelete.series },
			{ $pull: { books: bookToDelete.id } }
		);

		// удаление ссылки на книгу
		// у соответствующих авторов
		await Author.updateMany(
			{ _id: bookToDelete.authors },
			{ $pull: { books: bookToDelete.id } }
		);

		await bookToDelete.deleteOne();

		return bookToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getFilters = async () => {
	const books = await Book.find()
		.populate([
			{ path: 'product', select: 'price' },
			{ path: 'publisher', select: 'name' },
			{ path: 'authors', select: 'fullName' }
		])
		.lean();

	const filters = {
		trends: ['Новинки', 'Знижка'],
		types: [...new Set(books.map(b => b.type))],
		publishers: [...new Set(books.map(b => b.publisher.name))],
		languages: [...new Set(books.map(b => b.languages).flat())],
		authors: [
			...new Set(
				books.map(b => b.authors.map(a => a.fullName)).flat()
			)
		],
		price: {
			min: Math.min(...books.map(b => b.product.price)),
			max: Math.max(...books.map(b => b.product.price))
		}
	};

	return filters;
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne,
	getFilters
};
