import { Author, Book } from '../models/index.js';

const createOne = async authorData => {
	const { fullName } = authorData;

	if (await Author.exists({ fullName })) {
		throw {
			status: 409,
			message: `Author with full name '${fullName}' already exists`
		};
	}

	try {
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
		const author = await Author.findById(id);

		if (!author) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Author.find();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const oldAuthor = await Author.findById(id);

		if (!oldAuthor) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		const { fullName, books } = changes;

		if (await Author.exists({ fullName })) {
			throw {
				status: 409,
				message: `Author with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const added = books.filter(
				b => !oldAuthor.books.map(b => `${b}`).includes(b)
			);
			await Book.updateMany(
				{ _id: added },
				{ $push: { authors: oldAuthor.id } }
			);

			const removed = oldAuthor.books
				.map(b => `${b}`)
				.filter(b => !books.includes(b));
			await Book.updateMany(
				{ _id: removed },
				{ $pull: { authors: oldAuthor.id } }
			);
		}

		return await Author.findByIdAndUpdate(id, changes, { new: true });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const deletedAuthor = await Author.findByIdAndDelete(id);

		if (!deletedAuthor) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: deletedAuthor.books },
			{ $pull: { authors: deletedAuthor.id } }
		);

		return deletedAuthor;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
