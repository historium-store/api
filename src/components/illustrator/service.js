import Book from '../book/model.js';
import Illustrator from './model.js';

const createOne = async illustratorData => {
	let { fullName, books } = illustratorData;
	books = books ?? [];

	try {
		const existingIllustrator = await Illustrator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingIllustrator) {
			throw {
				status: 409,
				message: `Illustrator with full name '${fullName}' already exists`
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

		const newIllustrator = await Illustrator.create(illustratorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { illustrators: newIllustrator.id } }
		);

		return newIllustrator;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundIllustrator = await Illustrator.findById(id);

		if (!foundIllustrator || foundIllustrator.deletedAt) {
			throw {
				status: 404,
				message: `Illustrator with id '${id}' not found`
			};
		}

		return foundIllustrator;
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

		return await Illustrator.find(filter).limit(limit).skip(skip);
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
		const illustratorToUpdate = await Illustrator.findById(id);

		if (!illustratorToUpdate || illustratorToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Illustrator with id '${id}' not found`
			};
		}

		const existingIllustrator = await Illustrator.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (
			existingIllustrator &&
			existingIllustrato._id.toHexString() !== id
		) {
			throw {
				status: 409,
				message: `Illustrator with full name '${fullName}' already exists`
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

			const oldBookIds = illustratorToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { illustrators: illustratorToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { illustrators: illustratorToUpdate.id } }
			);
		}

		await illustratorToUpdate.updateOne(changes);

		return await Illustrator.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const illustratorToDelete = await Illustrator.findById(id);

		if (!illustratorToDelete || illustratorToDelete.deletedAt) {
			throw {
				status: 404,
				message: `Illustrator with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: illustratorToDelete.books },
			{ $pull: { illustrators: illustratorToDelete.id } }
		);

		await illustratorToDelete.deleteOne();

		return illustratorToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
