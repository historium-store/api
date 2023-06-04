import BasketItem from '../components/basket-item/model.js';

const getBasketTotalPrice = async doc => {
	try {
		let totalPrice = 0;

		if (doc.items && doc.items.length > 0) {
			const basketItems = await BasketItem.find({
				_id: { $in: doc.items }
			}).populate('product');

			for (const item of basketItems) {
				totalPrice += item.product.price * item.quantity;
			}
		}

		return totalPrice;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default getBasketTotalPrice;
