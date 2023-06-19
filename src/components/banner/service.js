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
		const foundBanner = await Banner.findOne({ _id: id });

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
		const exists = await Banner.exists({ _id: id });

		if (!exists) {
			throw {
				status: 404,
				message: `Banner with id '${id}' not found`
			};
		}

		return await Banner.findByIdAndUpdate(id, changes, { new: true });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const bannerToDelete = await Banner.findOne({ _id: id });

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
