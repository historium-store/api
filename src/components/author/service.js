import Book from '../book/model.js';
import Author from './model.js';

const createOne = async authorData => {
	let { fullName } = authorData;

	try {
		const existingAuthor = await Author.where('fullName')
			.equals(fullName)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (existingAuthor) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
			};
		}

		return await Author.create(authorData);
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
			.select('_id')
			.findOne()
			.lean();

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
			.sort({ [orderBy]: order })
			.lean();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { fullName } = changes;

	try {
		const authorToUpdate = await Author.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne();

		if (!authorToUpdate) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		if (fullName) {
			const existingAuthor = await Author.where('fullName')
				.equals(fullName)
				.where('deletedAt')
				.exists(false)
				.select('_id')
				.findOne()
				.lean();

			if (existingAuthor) {
				throw {
					status: 409,
					message: `Author with full name '${fullName}' already exists`
				};
			}
		}

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
			.select('books')
			.findOne();

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
