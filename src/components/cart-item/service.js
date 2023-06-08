import Cart from '../cart/model.js';
import Product from '../product/model.js';
import CartItem from './model.js';

const addItem = async (cart, itemData) => {
	const { product, quantity } = itemData;

	try {
		const productExists = await Product.exists({
			_id: product,
			deletedAt: { $exists: false }
		});

		if (!productExists) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const foundCart = await Cart.findById(cart).populate('items');

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${cart}' not found`
			};
		}

		const existingItem = foundCart.items.find(
			i => i.product.toHexString() === product
		);

		if (existingItem) {
			await existingItem.updateOne(
				quantity ? { $set: { quantity } } : { $inc: { quantity: 1 } }
			);

			return;
		}

		const newCartItem = await CartItem.create({
			cart: foundCart.id,
			product,
			quantity: 1
		});

		await foundCart.updateOne({
			$push: { items: newCartItem.id }
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const removeItem = async (cart, itemData) => {
	const { product, quantity } = itemData;
	try {
		const productExists = await Product.exists({
			_id: product,
			deletedAt: { $exists: false }
		});

		if (!productExists) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const foundCart = await Cart.findById(cart).populate('items');

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${cart}' not found`
			};
		}

		const existingItem = foundCart.items.find(
			i => i.product.toHexString() === product
		);

		if (!existingItem) {
			throw {
				status: 404,
				message: `Cart doesn't contain product with id '${product}'`
			};
		}

		if ((existingItem.quantity -= quantity ?? 1)) {
			return await existingItem.updateOne({ $inc: { quantity: -1 } });
		}

		await existingItem.deleteOne();

		await foundCart.updateOne({
			$pull: { items: existingItem.id }
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { addItem, removeItem };
