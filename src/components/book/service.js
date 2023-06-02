import productService from '../product/service.js';

import Author from '../author/model.js';
import BookSeries from '../book-series/model.js';
import Compiler from '../compiler/model.js';
import Editor from '../editor/model.js';
import Illustrator from '../illustrator/model.js';
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
		// проверка на существование
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

		// проверка на существование
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

		// проверка на существование
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

		// проверка на существование
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

		// проверка на существование
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

		// проверка на существование
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

		// проверка на существование
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
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим авторам
		await Author.updateMany(
			{ _id: authors },
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим составителям
		await Compiler.updateMany(
			{ _id: compilers },
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим переводчикам
		await Translator.updateMany(
			{ _id: translators },
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим иллюстраторам
		await Illustrator.updateMany(
			{ _id: illustrators },
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующим редакторам
		await Editor.updateMany(
			{ _id: editors },
			{ $push: { books: newBook.id } }
		);

		// добавление ссылки на новую книгу
		// соответствующей серии книг
		await BookSeries.updateOne(
			{ _id: series },
			{ $push: { books: newBook.id } }
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
		const foundBook = await Book.findById(id).populate([
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

		if (!foundBook || foundBook.deletedAt) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
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
	const { limit, offset: skip } = queryParams;
	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		// поиск продуктов, ограничение, смещение,
		// заполнение и выбор нужных полей
		const foundBooks = await Book.find(filter)
			.limit(limit)
			.skip(skip)
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

		return booksToReturn;
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
		const bookToUpdate = await Book.findById(id);

		if (!bookToUpdate || bookToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		if (product) {
			await productService.updateOne(bookToUpdate.product, product);

			delete changes.product;
		}

		//#region check existense

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

		//#endregion

		//#region updates

		if (publisher && newPublisher.id !== oldPublisher.id) {
			await newPublisher.updateOne({
				$push: { books: bookToUpdate.id }
			});
			await oldPublisher.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		if (series && newBookSeries.id !== oldBookSeries.id) {
			await newBookSeries.updateOne({
				$push: { books: bookToUpdate.id }
			});
			await oldBookSeries.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		await Author.updateMany(
			{ _id: addedAuthorIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Author.updateMany(
			{ _id: removedAuthorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		await Compiler.updateMany(
			{ _id: addedCompilerIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Compiler.updateMany(
			{ _id: removedCompilerIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		await Translator.updateMany(
			{ _id: addedTranslatorIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Translator.updateMany(
			{ _id: addedTranslatorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		await Illustrator.updateMany(
			{ _id: addedIllustratorIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Illustrator.updateMany(
			{ _id: addedIllustratorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		await Editor.updateMany(
			{ _id: addedEditorIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Editor.updateMany(
			{ _id: addedEditorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		//#endregion

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
		const bookToDelete = await Book.findById(id);

		if (!bookToDelete || bookToDelete.deletedAt) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		await Publisher.updateOne(
			{ _id: bookToDelete.publisher },
			{ $pull: { books: bookToDelete.id } }
		);

		await productService.deleteOne(bookToDelete.product);

		await BookSeries.updateOne(
			{ _id: bookToDelete.series },
			{ $pull: { books: bookToDelete.id } }
		);

		await Author.updateMany(
			{ _id: bookToDelete.authors },
			{
				$pull: { books: bookToDelete.id }
			}
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
export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};
