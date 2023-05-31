import mongoose from 'mongoose';

export const increaseProductsQuantities = async () => {
	try {
		await mongoose.connection
			.collection('productsQuantities')
			.updateOne({}, { $inc: { currentProductsQuantities: 1 } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export const decreaseProductsQuantities = async () => {
	try {
		await mongoose.connection
			.collection('productsQuantities')
			.updateOne({}, { $inc: { currentProductsQuantities: -1 } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
