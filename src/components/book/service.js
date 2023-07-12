import validator from 'validator';
import Author from '../author/model.js';
import BookSeries from '../book-series/model.js';
import Compiler from '../compiler/model.js';
import Editor from '../editor/model.js';
import Illustrator from '../illustrator/model.js';
import Product from '../product/model.js';
import Publisher from '../publisher/model.js';
import Section from '../section/model.js';
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
		await Promise.all([
			(async () => {
				const existingProduct = await Product.where('_id')
					.equals(product)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingProduct) {
					throw {
						status: 404,
						message: `Product with id '${product}' not found`
					};
				}
			})(),
			(async () => {
				const existingPublisher = await Publisher.where('_id')
					.equals(publisher)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingPublisher) {
					throw {
						status: 404,
						message: `Publisher with id '${publisher}' not found`
					};
				}
			})(),
			...authors.map(async id => {
				const existingAuthor = await Author.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingAuthor) {
					throw {
						status: 404,
						message: `Author with id '${id}' not found`
					};
				}
			}),
			...compilers.map(async id => {
				const existingCompiler = await Compiler.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingCompiler) {
					throw {
						status: 404,
						message: `Compiler with id '${id}' not found`
					};
				}
			}),
			...translators.map(async id => {
				const existingTranslator = await Translator.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingTranslator) {
					throw {
						status: 404,
						message: `Translator with id '${id}' not found`
					};
				}
			}),
			...illustrators.map(async id => {
				const existingIllustrator = await Illustrator.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingIllustrator) {
					throw {
						status: 404,
						message: `Illustrator with id '${id}' not found`
					};
				}
			}),
			...editors.map(async id => {
				const existingEditor = await Editor.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingEditor) {
					throw {
						status: 404,
						message: `Editor with id '${id}' not found`
					};
				}
			}),
			(async () => {
				if (series) {
					const existingBookSeries = await BookSeries.where('_id')
						.equals(series)
						.where('deletedAt')
						.exists(false)
						.select('_id')
						.findOne()
						.lean();

					if (!existingBookSeries) {
						throw {
							status: 404,
							message: `Book series with id '${series}' not found`
						};
					}
				}
			})()
		]);

		const newBook = await Book.create(bookData);

		await Publisher.updateOne(
			{ _id: publisher },
			{ $push: { books: newBook.id } }
		);

		await Author.updateMany(
			{ _id: authors },
			{ $push: { books: newBook.id } }
		);

		await Compiler.updateMany(
			{ _id: compilers },
			{ $push: { books: newBook.id } }
		);

		await Translator.updateMany(
			{ _id: translators },
			{ $push: { books: newBook.id } }
		);

		await Illustrator.updateMany(
			{ _id: illustrators },
			{ $push: { books: newBook.id } }
		);

		await Editor.updateMany(
			{ _id: editors },
			{ $push: { books: newBook.id } }
		);

		if (series) {
			await BookSeries.updateOne(
				{ _id: series },
				{ $push: { books: newBook.id } }
			);
		}

		return await getOne(newBook.id);
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
				.select('_id')
				.transform(product => ({ ...product, id: product._id }))
				.findOne()
				.lean();

			query.where('product').equals(product?.id);
		}

		const foundBook = await query
			.populate([
				{
					path: 'product',
					populate: [
						{ path: 'type', select: '-_id name key' },
						{ path: 'sections', select: 'name key' }
					]
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
			.findOne()
			.lean();

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

	try {
		const query = Book.where('deletedAt').exists(false);

		if (type) {
			query.where('type').equals(type);
		}

		if (publisher) {
			const foundPublishers = await Publisher.find({
				name: publisher,
				deletedAt: { $exists: false }
			});

			query.where('publisher').in(foundPublishers.map(p => p.id));
		}

		if (language) {
			query.where('languages').in(language);
		}

		if (author) {
			const foundAuthors = await Author.find({
				fullName: author,
				deletedAt: { $exists: false }
			});

			query.where('authors').in(foundAuthors.map(a => a.id));
		}

		if (price) {
			const foundProducts = await Product.find({
				price: { $gte: price[0], $lte: price[1] }
			});

			query.where('product').in(foundProducts.map(p => p.id));
		}

		const foundBooks = await query
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.populate([
				{
					path: 'product',
					populate: { path: 'type', select: '-_id name key' },
					select:
						'name creators key price quantity createdAt code images requiresDelivery',
					transform: product => ({
						...product,
						image: product.image ?? product.images[0],
						images: undefined
					})
				}
			])
			.select('-_id product')
			.lean();

		return {
			result: foundBooks.map(b => b.product),
			total: await Book.where('deletedAt')
				.exists(false)
				.countDocuments(),
			totalFound: foundBooks.length
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
		publisher,
		authors,
		compilers,
		translators,
		illustrators,
		editors,
		series
	} = changes;

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
				.select('_id')
				.transform(product => ({ ...product, id: product._id }))
				.findOne()
				.lean();

			query.where('product').equals(product?.id);
		}

		const bookToUpdate = await query.findOne();

		if (!bookToUpdate) {
			throw {
				status: 404,
				message: `Book with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		if (publisher) {
			const existingPublisher = await Publisher.where('_id')
				.equals(publisher)
				.where('deletedAt')
				.exists(false)
				.select('-_id')
				.findOne()
				.lean();

			if (!existingPublisher) {
				throw {
					status: 404,
					message: `Publisher with id '${publisher}' not found`
				};
			}
		}

		if (authors) {
			await Promise.all(
				authors.map(async id => {
					const existingAuthor = await Author.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('-_id')
						.findOne()
						.lean();

					if (!existingAuthor) {
						throw {
							status: 404,
							message: `Author with id '${id}' not found`
						};
					}
				})
			);
		}

		if (compilers) {
			await Promise.all(
				compilers.map(async id => {
					const existingCompiler = await Compiler.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('-_id')
						.findOne()
						.lean();

					if (!existingCompiler) {
						throw {
							status: 404,
							message: `Compiler with id '${id}' not found`
						};
					}
				})
			);
		}

		if (translators) {
			await Promise.all(
				translators.map(async id => {
					const existingTranslator = await Translator.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('-_id')
						.findOne()
						.lean();

					if (!existingTranslator) {
						throw {
							status: 404,
							message: `Translator with id '${id}' not found`
						};
					}
				})
			);
		}

		if (illustrators) {
			await Promise.all(
				illustrators.map(async id => {
					const existingIllustrator = await Illustrator.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('-_id')
						.findOne()
						.lean();

					if (!existingIllustrator) {
						throw {
							status: 404,
							message: `Illustrator with id '${id}' not found`
						};
					}
				})
			);
		}

		if (editors) {
			await Promise.all(
				editors.map(async id => {
					const existingEditor = await Editor.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('-_id')
						.findOne()
						.lean();

					if (!existingEditor) {
						throw {
							status: 404,
							message: `Editor with id '${id}' not found`
						};
					}
				})
			);
		}

		if (series) {
			const existingBookSeries = await BookSeries.where('_id')
				.equals(series)
				.where('deletedAt')
				.exists(false)
				.select('-_id')
				.findOne()
				.lean();

			if (!existingBookSeries) {
				throw {
					status: 404,
					message: `Book series with id '${series}' not found`
				};
			}
		}

		const samePublisher =
			bookToUpdate.publisher.toHexString() === publisher?.id;

		if (publisher && !samePublisher) {
			await Publisher.updateOne(
				{ _id: bookToUpdate.publisher },
				{ $pull: { books: bookToUpdate.id } }
			);

			await Publisher.updateOne(
				{ _id: publisher },
				{ $push: { books: bookToUpdate.id } }
			);
		}

		if (authors) {
			const oldAuthorIds = bookToUpdate.authors.map(a =>
				a.toHexString()
			);
			const addedAuthorIds = authors.filter(
				a => !oldAuthorIds.includes(a)
			);
			const removedAuthorIds = oldAuthorIds.filter(
				a => !authors.includes(a)
			);

			await Author.updateMany(
				{ _id: addedAuthorIds },
				{ $push: { books: bookToUpdate.id } }
			);

			await Author.updateMany(
				{ _id: removedAuthorIds },
				{ $pull: { books: bookToUpdate.id } }
			);
		}

		if (compilers) {
			const oldCompilerIds = bookToUpdate.compilers.map(c =>
				c.toHexString()
			);
			const addedCompilerIds = compilers.filter(
				c => !oldCompilerIds.includes(c)
			);
			const removedCompilerIds = oldCompilerIds.filter(
				c => !compilers.includes(c)
			);

			await Compiler.updateMany(
				{ _id: addedCompilerIds },
				{ $push: { books: bookToUpdate.id } }
			);

			await Compiler.updateMany(
				{ _id: removedCompilerIds },
				{ $pull: { books: bookToUpdate.id } }
			);
		}

		if (translators) {
			const oldTranslatorIds = bookToUpdate.translators.map(t =>
				t.toHexString()
			);
			const addedTranslatorIds = translators.filter(
				t => !oldTranslatorIds.includes(t)
			);
			const removedTranslatorIds = oldTranslatorIds.filter(
				t => !translators.includes(t)
			);

			await Translator.updateMany(
				{ _id: addedTranslatorIds },
				{ $push: { books: bookToUpdate.id } }
			);

			await Translator.updateMany(
				{ _id: removedTranslatorIds },
				{ $pull: { books: bookToUpdate.id } }
			);
		}

		if (illustrators) {
			const oldIllustratorIds = bookToUpdate.illustrators.map(i =>
				i.toHexString()
			);
			const addedIllustratorIds = illustrators.filter(
				i => !oldIllustratorIds.includes(i)
			);
			const removedIllustratorIds = oldIllustratorIds.filter(
				i => !illustrators.includes(i)
			);

			await Illustrator.updateMany(
				{ _id: addedIllustratorIds },
				{ $push: { books: bookToUpdate.id } }
			);

			await Illustrator.updateMany(
				{ _id: removedIllustratorIds },
				{ $pull: { books: bookToUpdate.id } }
			);
		}

		if (editors) {
			const oldEditorIds = bookToUpdate.editors.map(e =>
				e.toHexString()
			);
			const addedEditorIds = editors.filter(
				e => !oldEditorIds.includes(e)
			);
			const removedEditorIds = oldEditorIds.filter(
				e => !editors.includes(e)
			);

			await Editor.updateMany(
				{ _id: addedEditorIds },
				{ $push: { books: bookToUpdate.id } }
			);

			await Editor.updateMany(
				{ _id: removedEditorIds },
				{ $pull: { books: bookToUpdate.id } }
			);
		}

		const sameBookSeries =
			bookToUpdate.series?.toHexString() === series?.id;

		if (series && !sameBookSeries) {
			await sameBookSeries.updateOne(
				{ _id: bookToUpdate.series },
				{ $pull: { books: bookToUpdate.id } }
			);

			await sameBookSeries.updateOne(
				{ _id: series },
				{ $push: { books: bookToUpdate.id } }
			);
		}

		await bookToUpdate.updateOne(changes);

		return await getOne(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
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
				.select('_id')
				.transform(product => ({ ...product, id: product._id }))
				.findOne()
				.lean();

			query.where('product').equals(product?.id);
		}

		const bookToDelete = await query.findOne();

		if (!bookToDelete) {
			throw {
				status: 404,
				message: `Book with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		await bookToDelete.populate({
			path: 'product',
			select: 'sections',
			transform: product => ({
				...product.toObject(),
				id: product._id
			})
		});

		await Product.deleteOne(bookToDelete.product.id);

		await Section.updateMany(
			{ _id: bookToDelete.product.sections },
			{ $pull: { products: bookToDelete.product.id } }
		);

		await Publisher.updateOne(
			{ _id: bookToDelete.publisher },
			{ $pull: { books: bookToDelete.id } }
		);

		await Author.updateMany(
			{ _id: bookToDelete.authors },
			{ $pull: { books: bookToDelete.id } }
		);

		await Compiler.updateMany(
			{ _id: bookToDelete.compilers },
			{ $pull: { books: bookToDelete.id } }
		);

		await Translator.updateMany(
			{ _id: bookToDelete.translators },
			{ $pull: { books: bookToDelete.id } }
		);

		await Illustrator.updateMany(
			{ _id: bookToDelete.illustrators },
			{ $pull: { books: bookToDelete.id } }
		);

		await Editor.updateMany(
			{ _id: bookToDelete.editors },
			{ $pull: { books: bookToDelete.id } }
		);

		await BookSeries.updateOne(
			{ _id: bookToDelete.series },
			{ $pull: { books: bookToDelete.id } }
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
		.select('_id type languages')
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
