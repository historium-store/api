import { Author, Book } from '../models/index.js';
import bookService from './bookService.js';

const createOne = async authorData => {
	const { fullName, books } = authorData;

	try {
		if (await Author.exists({ fullName })) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
			};
		}

		for (let book of books) {
			await bookService.getOne(book);
		}

		const newAuthor = await Author.create(authorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { authors: newAuthor.id } }
		);

		return await Author.findById(newAuthor.id)
			.populate({
				path: 'books',
				populate: ['publisher', 'series']
			})
			.populate({
				path: 'books',
				populate: {
					path: 'product',
					populate: ['type', 'sections']
				}
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
		if (!(await Author.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return await Author.findById(id)
			.populate({
				path: 'books',
				populate: ['publisher', 'series']
			})
			.populate({
				path: 'books',
				populate: {
					path: 'product',
					populate: ['type', 'sections']
				}
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
		return await Author.find()
			.populate({
				path: 'books',
				populate: ['publisher', 'series']
			})
			.populate({
				path: 'books',
				populate: {
					path: 'product',
					populate: ['type', 'sections']
				}
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
		const authorToUpdate = await Author.findById(id);

		if (!authorToUpdate) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		if (await Author.exists({ fullName })) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const oldBookIds = authorToUpdate.books.map(b =>
				b.id.toString('hex')
			);
			const newBookIds = [];
			for (let book of books) {
				newBookIds.push((await bookService.getOne(book)).id);
			}

			const addedBookIds = newBookIds.filter(
				b => !oldBookIds.includes(b)
			);
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { authors: authorToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !newBookIds.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { authors: authorToUpdate.id } }
			);
		}

		return await Author.findByIdAndUpdate(id, changes, {
			new: true
		})
			.populate({ path: 'books', populate: ['publisher', 'series'] })
			.populate({
				path: 'books',
				populate: {
					path: 'product',
					populate: ['type', 'sections']
				}
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
		const authorToDelete = await Author.findById(id);

		if (!authorToDelete) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: authorToDelete.books },
			{ $pull: { authors: authorToDelete.id } }
		);

		await authorToDelete.deleteOne();

		return authorToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
