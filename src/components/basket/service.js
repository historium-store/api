import { Basket } from './model.js';

const getByUserId = async id => {
	const foundBasket = await Basket.findOne({ user: id });

	if (!foundBasket) {
		throw {
			status: 404,
			message: `Basket for user with id '${id}' not found`
		};
	}

	return foundBasket;
};

export default { getByUserId };
