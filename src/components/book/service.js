import validator from 'validator';
import Author from '../author/model.js';
import BookSeries from '../book-series/model.js';
import Compiler from '../compiler/model.js';
import Editor from '../editor/model.js';
import Illustrator from '../illustrator/model.js';
import Product from '../product/model.js';
import productService from '../product/service.js';
import Publisher from '../publisher/model.js';
import Translator from '../translator/model.js';
import Book from './model.js';

const createOne = async bookData => {
	let {
		product,
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
		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const existingPublisher = await Publisher.where('_id')
			.equals(publisher)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!existingPublisher) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		await Promise.all(
			authors.map(async id => {
				const existingAuthor = await Author.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingAuthor) {
					throw {
						status: 404,
						message: `Author with id '${id}' not found`
					};
				}
			})
		);

		await Promise.all(
			compilers.map(async id => {
				const existingCompiler = await Compiler.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingCompiler) {
					throw {
						status: 404,
						message: `Compiler with id '${id}' not found`
					};
				}
			})
		);

		await Promise.all(
			translators.map(async id => {
				const existingTranslator = await Translator.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingTranslator) {
					throw {
						status: 404,
						message: `Translator with id '${id}' not found`
					};
				}
			})
		);

		await Promise.all(
			illustrators.map(async id => {
				const existingIllustrator = await Illustrator.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingIllustrator) {
					throw {
						status: 404,
						message: `Illustrator with id '${id}' not found`
					};
				}
			})
		);

		await Promise.all(
			editors.map(async id => {
				const existingEditor = await Editor.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingEditor) {
					throw {
						status: 404,
						message: `Editor with id '${id}' not found`
					};
				}
			})
		);

		if (series) {
			const existingBookSeries = await BookSeries.where('_id')
				.equals(series)
				.where('deletedAt')
				.exists(false);

			if (!existingBookSeries) {
				throw {
					status: 404,
					message: `Book series with id '${series}' not found`
				};
			}
		}

		const newBook = await Book.create(bookData);

		await Product.updateOne(
			{ _id: product },
			{ $set: { specificProduct: newBook } }
		);

		await Publisher.updateOne(
			{ _id: publisher },
			{ $push: { books: newBook } }
		);

		await Author.updateMany(
			{ _id: authors },
			{ $push: { books: newBook } }
		);

		await Compiler.updateMany(
			{ _id: compilers },
			{ $push: { books: newBook } }
		);

		await Translator.updateMany(
			{ _id: translators },
			{ $push: { books: newBook } }
		);

		await Illustrator.updateMany(
			{ _id: illustrators },
			{ $push: { books: newBook } }
		);

		await Editor.updateMany(
			{ _id: editors },
			{ $push: { books: newBook } }
		);

		await BookSeries.updateOne(
			{ _id: series },
			{ $push: { books: newBook } }
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
		const query = Book.where('deletedAt').exists(false);

		const isMongoId = validator.isMongoId(id);

		if (isMongoId) {
			query.where('_id').equals(id);
		} else {
			const product = await Product.where('key')
				.equals(id)
				.where('deletedAt')
				.exists(false)
				.findOne();

			query.where('product').equals(product?.id);
		}

		const foundBook = await query
			.populate([
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
			])
			.findOne();

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

		filter.authors = { $in: foundAuthors.map(a => a.id) };
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
				a.toHexString()
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
				c.toHexString()
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
				t.toHexString()
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

			const oldIllustratorIds = bookToUpdate.illustrators.map(i =>
				i.toHexString()
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

			const oldEditorIds = bookToUpdate.editors.map(e =>
				e.toHexString()
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
		const samePublisher = newPublisher?.id === oldPublisher?.id;
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
		const sameBookSeries = newBookSeries?.id !== oldBookSeries?.id;
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
		const bookToDelete = await Book.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!bookToDelete) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		await productService.deleteOne(bookToDelete.product);

		await Publisher.updateOne(
			{ _id: bookToDelete.publisher },
			{ $pull: { books: bookToDelete.id } }
		);

		await Author.updateMany(
			{ _id: bookToDelete.authors },
			{ $pull: { books: id } }
		);

		await Compiler.updateMany(
			{ _id: bookToDelete.compilers },
			{ $pull: { books: id } }
		);

		await Translator.updateMany(
			{ _id: bookToDelete.translators },
			{ $pull: { books: id } }
		);

		await Illustrator.updateMany(
			{ _id: bookToDelete.illustrators },
			{ $pull: { books: id } }
		);

		await Editor.updateMany(
			{ _id: bookToDelete.editors },
			{ $pull: { books: id } }
		);

		await BookSeries.updateOne(
			{ _id: bookToDelete.series },
			{ $pull: { books: id } }
		);

		await bookToDelete.deleteOne();
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
		trend: ['Новинки', 'Знижка'],
		type: [...new Set(books.map(b => b.type))],
		publisher: [...new Set(books.map(b => b.publisher.name))],
		language: [...new Set(books.map(b => b.languages).flat())],
		author: [
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
