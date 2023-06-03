import Product from '../product/model.js';
import { Basket, BasketItem } from './model.js';

const getByIdFromToken = async id => {
	try {
		const foundBasket = await Basket.findById(id).populate('items');

		if (!foundBasket) {
			throw {
				status: 404,
				message: `Basket with id '${id}' not found`
			};
		}

		return foundBasket;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const addItem = async (basket, product) => {
	try {
		const productExists = await Product.exists({
			_id: product,
			deletedAt: { $exists: false }
		});

		if (!productExists) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		const foundBasket = await Basket.findById(basket).populate(
			'items'
		);

		if (!foundBasket) {
			throw {
				status: 404,
				message: `Basket with id '${id}' not found`
			};
		}

		const existingItem = foundBasket.items.find(
			i => i.product.toHexString() === product
		);

		if (existingItem) {
			await existingItem.updateOne({ $inc: { quantity: 1 } });

			return;
		}

		const newBasketItem = await BasketItem.create({
			basket: foundBasket.id,
			product,
			quantity: 1
		});

		await foundBasket.updateOne({
			$push: { items: newBasketItem.id }
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const clearItems = async basket => {
	try {
		const foundBasket = await Basket.findById(basket);

		if (!foundBasket) {
			throw {
				status: 404,
				message: `Basket with id '${id}' not found`
			};
		}

		await BasketItem.deleteMany({ _id: foundBasket.items });

		await foundBasket.updateOne({ items: [] });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { getByIdFromToken, addItem, clearItems };
