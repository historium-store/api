import mongoose from 'mongoose';

export const getCurrentProductCode = async () => {
	try {
		const productCodeCounter = await mongoose.connection
			.collection('productCodeCounter')
			.findOne();

		return productCodeCounter.currentCode;
	} catch (error) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
