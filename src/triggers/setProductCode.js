import mongoose from 'mongoose';

const setProductCode = async doc => {
	try {
		await mongoose.connection
			.collection('productCodeCounter')
			.updateOne({}, { $inc: { currentCode: 1 } });

		const productCodeCounter = await mongoose.connection
			.collection('productCodeCounter')
			.findOne();

		await doc.set('code', productCodeCounter.currentCode);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default setProductCode;
