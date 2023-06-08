import CartItem from '../components/cart-item/model.js';

const getCartTotalPrice = async doc => {
	try {
		let totalPrice = 0;

		if (doc.items && doc.items.length > 0) {
			const cartItems = await CartItem.find({
				_id: { $in: doc.items }
			}).populate('product');

			for (const item of cartItems) {
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

export default getCartTotalPrice;
