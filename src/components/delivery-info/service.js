import DeliveryInfo from './model.js';

const updateOne = async (id, changes) => {
	try {
		const deliveryInfoToUpdate = await DeliveryInfo.findById(id);

		if (!deliveryInfoToUpdate) {
			throw {
				status: 404,
				message: `Delivery info with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (deliveryInfoToUpdate[key] = changes[key])
		);

		return await deliveryInfoToUpdate.save();
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
