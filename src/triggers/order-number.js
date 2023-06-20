import mongoose from 'mongoose';

export const updateOrderNumber = async doc => {
	try {
		const orderCodeCounter = await mongoose.connection
			.collection('order_number_counter')
			.findOneAndUpdate(
				{},
				{ $inc: { currentNumber: 1 } },
				{ new: true }
			);

		await doc.set('number', orderCodeCounter.currentNumber);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export const getOrderNumber = async () => {
	try {
		const orderNumberCounter = await mongoose.connection
			.collection('order_number_counter')
			.findOne();

		return orderNumberCounter.currentNumber;
	} catch (error) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};
