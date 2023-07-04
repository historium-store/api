import mongoose from 'mongoose';

export const increaseProductsQuantity = async () => {
	try {
		await mongoose.connection
			.collection('products_quantity')
			.updateOne({}, { $inc: { currentProductsQuantity: 1 } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export const decreaseProductsQuantity = async () => {
	try {
		await mongoose.connection
			.collection('products_quantity')
			.updateOne({}, { $inc: { currentProductsQuantity: -1 } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
