import mongoose from 'mongoose';

export const setProductCode = async doc => {
	try {
		await mongoose.connection
			.collection('product_code_counter')
			.updateOne({}, { $inc: { currentCode: 1 } });

		const productCodeCounter = await mongoose.connection
			.collection('product_code_counter')
			.findOne();

		await doc.set('code', productCodeCounter.currentCode);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
