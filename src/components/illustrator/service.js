import Book from '../book/model.js';
import Illustrator from './model.js';

const checkIllustratorExistence = async fullName => {
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
};

const createOne = async illustratorData => {
	let { fullName, books } = illustratorData;
	books = books ?? [];

	try {
		await checkIllustratorExistence(fullName);

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

		const newIllustrator = await Illustrator.create(illustratorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { illustrators: newIllustrator } }
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
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		return await Illustrator.where('deletedAt')
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
	const { fullName, books } = changes;

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
			await checkIllustratorExistence(fullName);
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

			const oldBookIds = illustratorToUpdate.books.map(b =>
				b.toHexString()
			);
			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);

			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { illustrators: illustratorToUpdate.id } }
			);

			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { illustrators: illustratorToUpdate.id } }
			);
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
