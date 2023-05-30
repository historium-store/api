import Book from '../book/model.js';
import Author from './model.js';

const createOne = async authorData => {
	let { fullName, books } = authorData;
	books = books ?? [];

	try {
		const existingAuthor = await Author.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingAuthor) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
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

		const newAuthor = await Author.create(authorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { authors: newAuthor.id } }
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
		const foundAuthor = await Author.findById(id);

		if (!foundAuthor || foundAuthor.deletedAt) {
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
	const { limit, offset: skip } = queryParams;

	try {
		const filter = {
			deletedAt: { $exists: false }
		};

		return await Author.find(filter).limit(limit).skip(skip);
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

		if (!authorToUpdate || authorToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		const existingAuthor = await Author.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingAuthor && existingAuthor._id.toHexString() !== id) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
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

			const oldBookIds = authorToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { authors: authorToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { authors: authorToUpdate.id } }
			);
		}

		await authorToUpdate.updateOne(changes);

		return await Author.findById(id);
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

		if (!authorToDelete || authorToDelete.deletedAt) {
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
