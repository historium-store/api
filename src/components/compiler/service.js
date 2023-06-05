import Book from '../book/model.js';
import Compiler from './model.js';

const createOne = async compilerData => {
	let { fullName, books } = compilerData;
	books = books ?? [];

	try {
		const existingCompiler = await Compiler.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingCompiler) {
			throw {
				status: 409,
				message: `Compiler with full name '${fullName}' already exists`
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

		const newCompiler = await Compiler.create(compilerData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { compilers: newCompiler.id } }
		);

		return newCompiler;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundCompiler = await Compiler.findById(id);

		if (!foundCompiler || foundCompiler.deletedAt) {
			throw {
				status: 404,
				message: `Compiler with id '${id}' not found`
			};
		}

		return foundCompiler;
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
		const filter = {
			deletedAt: { $exists: false }
		};

		return await Compiler.find(filter)
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
	const { fullName, books } = changes;

	try {
		const compilerToUpdate = await Compiler.findById(id);

		if (!compilerToUpdate || compilerToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Compiler with id '${id}' not found`
			};
		}

		const existingCompiler = await Compiler.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (
			existingCompiler &&
			existingCompiler._id.toHexString() !== id
		) {
			throw {
				status: 409,
				message: `Compiler with full name '${fullName}' already exists`
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

			const oldBookIds = compilerToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { compilers: compilerToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { compilers: compilerToUpdate.id } }
			);
		}

		await compilerToUpdate.updateOne(changes);

		return await Compiler.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const compilerToDelete = await Compiler.findById(id);

		if (!compilerToDelete || compilerToDelete.deletedAt) {
			throw {
				status: 404,
				message: `Compiler with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: compilerToDelete.books },
			{ $pull: { compilers: compilerToDelete.id } }
		);

		await compilerToDelete.deleteOne();

		return compilerToDelete;
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
