import Book from '../book/model.js';
import Compiler from './model.js';

const createOne = async compilerData => {
	let { fullName } = compilerData;

	try {
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

		return await Compiler.create(compilerData);
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
	const { limit, offset: skip } = queryParams;

	try {
		const foundCompilers = await Compiler.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.lean();

		foundCompilers.sort((a, b) =>
			a.fullName.localeCompare(b.fullName, 'uk')
		);

		return foundCompilers;
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
