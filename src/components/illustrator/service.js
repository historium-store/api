import Book from '../book/model.js';
import Illustrator from './model.js';

const createOne = async illustratorData => {
	let { fullName } = illustratorData;

	try {
		const existingIllustrator = await Illustrator.where('fullName')
			.equals(fullName)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (existingIllustrator) {
			throw {
				status: 409,
				message: `Illustrator with full name '${fullName}' already exists`
			};
		}

		return await Illustrator.create(illustratorData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundIllustrator = await Illustrator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundIllustrator) {
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
		const foundIllustrators = await Illustrator.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.lean();

		foundIllustrators.sort((a, b) =>
			a.fullName.localeCompare(b.fullName, 'uk')
		);

		return foundIllustrators;
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
		const illustratorToUpdate = await Illustrator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!illustratorToUpdate) {
			throw {
				status: 404,
				message: `Illustrator with id '${id}' not found`
			};
		}

		if (fullName) {
			const existingIllustrator = await Illustrator.where('fullName')
				.equals(fullName)
				.where('deletedAt')
				.exists(false)
				.findOne();

			if (existingIllustrator) {
				throw {
					status: 409,
					message: `Illustrator with full name '${fullName}' already exists`
				};
			}
		}

		Object.keys(changes).forEach(key => {
			illustratorToUpdate[key] = changes[key];
		});

		return await illustratorToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const illustratorToDelete = await Illustrator.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!illustratorToDelete) {
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
