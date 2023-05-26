import mongoose from 'mongoose';

const productCodeTrigger = async doc => {
	try {
		const productCodeCounter = await mongoose.connection
			.collection('productCodeCounter')
			.findOne();

		console.log('currentCode:', productCodeCounter.currentCode);

		doc.set('code', productCodeCounter.currentCode);

		await mongoose.connection
			.collection('productCodeCounter')
			.updateOne({}, { $inc: { currentCode: 1 } });
	} catch (err) {
		console.error(err);
	}
};

export default productCodeTrigger;
