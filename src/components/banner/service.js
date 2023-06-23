import Banner from './model.js';

const createOne = async bannerData => {
	try {
		return await Banner.create(bannerData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundBanner = await Banner.where('_id')
			.equals(id)
			.findOne();

		if (!foundBanner) {
			throw {
				status: 404,
				message: `Banner with id '${id}' not found`
			};
		}

		return foundBanner;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Banner.find();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const bannerToUpdate = await Banner.where('id')
			.equals(id)
			.findOne();

		if (!bannerToUpdate) {
			throw {
				status: 404,
				message: `Banner with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (bannerToUpdate[key] = changes[key])
		);

		return await bannerToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const bannerToDelete = await Banner.where('_id')
			.equals(id)
			.findOne();

		if (!bannerToDelete) {
			throw {
				status: 404,
				message: `Banner with id '${id}' not found`
			};
		}

		await bannerToDelete.deleteOne();
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
