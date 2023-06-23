import AddressInfo from './model.js';

const updateOne = async (id, changes) => {
	try {
		const addressInfoToUpdate = await AddressInfo.findById(id);

		if (!addressInfoToUpdate) {
			throw {
				status: 404,
				message: `Address info with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (addressInfoToUpdate[key] = changes[key])
		);

		return await addressInfoToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	updateOne
};
