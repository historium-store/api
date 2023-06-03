import BasketItem from '../components/basket-item/model.js';

const getBasketTotalPrice = async doc => {
	let totalPrice = 0;
	if (doc.items && doc.items.length > 0) {
		const basketItems = await BasketItem.find({
			_id: { $in: doc.items }
		})
			.populate('product')
			.exec();
		for (let item of basketItems) {
			totalPrice += item.product.price * item.quantity;
		}
	}
	return totalPrice;
};

export default getBasketTotalPrice;
