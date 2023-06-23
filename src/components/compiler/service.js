import Book from '../book/model.js';
import Compiler from './model.js';

const checkCompilerExistense = async fullName => {
	const existingCompiler = await Compiler.where('fullName')
		.equals(fullName)
		.where('deletedAt')
		.exists(false)
		.findOne();

	if (existingCompiler) {
		throw {
			status: 409,
			message: `Compiler with full name '${fullName}' already exists`
		};
	}
};

const createOne = async compilerData => {
	let { fullName, books } = compilerData;
	books = books ?? [];

	try {
		await checkCompilerExistense(fullName);

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

		const newCompiler = await Compiler.create(compilerData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { compilers: newCompiler } }
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
		const foundCompiler = await Compiler.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundCompiler) {
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
		return await Compiler.where('deletedAt')
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

	try {
		const compilerToUpdate = await Compiler.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!compilerToUpdate) {
			throw {
				status: 404,
				message: `Compiler with id '${id}' not found`
			};
		}

		if (fullName) {
			await checkCompilerExistense(fullName);
		}

		if (books) {
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

			const oldBookIds = compilerToUpdate.books.map(b =>
				b.toHexString()
			);
			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);

			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { compilers: compilerToUpdate.id } }
			);

			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { compilers: compilerToUpdate.id } }
			);
		}

		Object.keys(changes).forEach(
			key => (compilerToUpdate[key] = changes[key])
		);

		return await compilerToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const compilerToDelete = await Compiler.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!compilerToDelete) {
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
