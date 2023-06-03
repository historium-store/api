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

export default { getByIdFromToken, clearItems };
