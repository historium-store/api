import mongoose from 'mongoose';

const setProductCode = async doc => {
	try {
		const productCodeCounter = await mongoose.connection
			.collection('productCodeCounter')
			.findOne();

		console.log('currentCode:', productCodeCounter.currentCode);

		await doc.set('code', productCodeCounter.currentCode);

		await mongoose.connection
			.collection('productCodeCounter')
			.updateOne({}, { $inc: { currentCode: 1 } });
	} catch (err) {
		console.error(err);
	}
};

export default setProductCode;
