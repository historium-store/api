import Publisher from './model.js';

const createOne = async publisherData => {
	let { name } = publisherData;

	try {
		const existingPublisher = await Publisher.where('name')
			.equals(name)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (existingPublisher) {
			throw {
				status: 409,
				message: `Publisher with name '${name}' already exists`
			};
		}

		return await Publisher.create(publisherData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundPublisher = await Publisher.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundPublisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return foundPublisher;
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
		return await Publisher.where('deletedAt')
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
	const { name } = changes;

	try {
		const publisherToUpdate = await Publisher.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!publisherToUpdate) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		if (name) {
			const existingPublisher = await Publisher.where('name')
				.equals(name)
				.where('deletedAt')
				.exists(false)
				.findOne();

			if (existingPublisher) {
				throw {
					status: 409,
					message: `Publisher with name '${name}' already exists`
				};
			}
		}

		Object.keys(changes).forEach(
			key => (publisherToUpdate[key] = changes[key])
		);

		return await publisherToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const publisherToDelete = await Publisher.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!publisherToDelete) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		if (publisherToDelete.books.length) {
			throw {
				status: 400,
				message: "Can't delete publisher with published books"
			};
		}

		await publisherToDelete.deleteOne();
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
