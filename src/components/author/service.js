import Book from '../book/model.js';
import Author from './model.js';

const checkExistenseByFullName = async fullName => {
	const existingAuthor = await Author.where('fullName')
		.equals(fullName)
		.where('deletedAt')
		.exists(false)
		.findOne();

	if (existingAuthor) {
		throw {
			status: 409,
			message: `Author with full name '${fullName}' already exists`
		};
	}
};

const createOne = async authorData => {
	let { fullName, books } = authorData;
	books = books ?? [];

	try {
		checkExistenseByFullName(fullName);

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

		const newAuthor = await Author.create(authorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { authors: newAuthor } }
		);

		return newAuthor;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundAuthor = await Author.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundAuthor) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return foundAuthor;
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
		return await Author.where('deletedAt')
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
	let { fullName, books } = changes;
	books = books ?? [];

	try {
		const authorToUpdate = await Author.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!authorToUpdate) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		checkExistenseByFullName(fullName);

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

		const oldBookIds = authorToUpdate.books.map(b => b.toHexString());
		const addedBookIds = books.filter(b => !oldBookIds.includes(b));
		const removedBookIds = oldBookIds.filter(b => !books.includes(b));

		await Book.updateMany(
			{ _id: addedBookIds },
			{ $push: { authors: authorToUpdate } }
		);
		await Book.updateMany(
			{ _id: removedBookIds },
			{ $pull: { authors: authorToUpdate } }
		);

		Object.keys(changes).forEach(key => {
			authorToUpdate[key] = changes[key];
		});

		return await authorToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const authorToDelete = await Author.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!authorToDelete) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		const authorHasBooks = authorToDelete.books.length;

		if (authorHasBooks) {
			throw {
				status: 400,
				message: "Can't delete author that has published books"
			};
		}

		await authorToDelete.deleteOne();
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
