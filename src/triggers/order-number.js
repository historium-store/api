import mongoose from 'mongoose';

export const updateOrderNumber = async doc => {
	try {
		const orderCodeCounter = await mongoose.connection
			.collection('order_number_counter')
			.findOneAndUpdate(
				{},
				{ $inc: { 'value.number': 1 } },
				{ new: false }
			);

		await doc.set('number', orderCodeCounter.value.number);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
