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
		const foundBanner = await Banner.findById(id).lean();

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
		return await Banner.find().lean();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const bannerToUpdate = await Banner.findById(id).select('_id');

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
		const bannerToDelete = await Banner.findById(id).select('_id');

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
