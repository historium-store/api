import Cart from '../cart/model.js';
import Product from '../product/model.js';
import CartItem from './model.js';

const addItem = async (cart, itemData) => {
	const { product, quantity } = itemData;

	try {
		const productExists = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!productExists) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const foundCart = await Cart.findById(cart);

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${cart}' not found`
			};
		}

		const existingItem = await CartItem.findOne({ cart, product });

		if (existingItem) {
			existingItem.quantity = quantity ?? existingItem.quantity + 1;

			await existingItem.save();

			return;
		}

		await foundCart.updateOne({
			$push: {
				items: await CartItem.create({
					cart,
					product,
					quantity: quantity ?? 1
				})
			}
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
		const productExists = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!productExists) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const foundCart = await Cart.findById(cart);

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${cart}' not found`
			};
		}

		const existingItem = await CartItem.findOne({ cart, product });

		if (!existingItem) {
			throw {
				status: 404,
				message: `Cart doesn't contain product with id '${product}'`
			};
		}

		if ((existingItem.quantity -= quantity ?? 1) > 0) {
			await existingItem.updateOne({
				$inc: { quantity: -(quantity ?? 1) }
			});

			return;
		}

		await existingItem.deleteOne();

		await foundCart.updateOne({ $pull: { items: existingItem } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	addItem,
	removeItem
};
