import Basket from '../basket/model.js';
import Product from '../product/model.js';
import BasketItem from './model.js';

const addItem = async (basket, itemData) => {
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

		const foundBasket = await Basket.findById(basket).populate(
			'items'
		);

		if (!foundBasket) {
			throw {
				status: 404,
				message: `Basket with id '${basket}' not found`
			};
		}

		const existingItem = foundBasket.items.find(
			i => i.product.toHexString() === product
		);

		if (existingItem) {
			await existingItem.updateOne(
				quantity ? { $set: { quantity } } : { $inc: { quantity: 1 } }
			);

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

const removeItem = async (basket, product) => {
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

	const foundBasket = await Basket.findById(basket).populate('items');

	if (!foundBasket) {
		throw {
			status: 404,
			message: `Basket with id '${basket}' not found`
		};
	}

	const existingItem = foundBasket.items.find(
		i => i.product.toHexString() === product
	);

	if (!existingItem) {
		throw {
			status: 404,
			message: `Basket doesn't contain product with id '${product}'`
		};
	}

	if (--existingItem.quantity) {
		await existingItem.updateOne({ $inc: { quantity: -1 } });

		return;
	}

	await existingItem.deleteOne();

	await foundBasket.updateOne({ $pull: { items: existingItem.id } });
};

export default { addItem, removeItem };
