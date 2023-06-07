import BasketItem from '../basket-item/model.js';
import Book from '../book/model.js';
import Product from '../product/model.js';
import Basket from './model.js';

const getByIdFromToken = async id => {
	try {
		let foundBasket = await Basket.findById(id)
			.populate({
				path: 'items',
				populate: {
					path: 'product',
					populate: { path: 'type', select: '-_id name' },
					select: 'name price quantity code images specificProduct'
				},
				select: 'quantity createdAt'
			})
			.select('-_id items');

		if (!foundBasket) {
			throw {
				status: 404,
				message: `Basket with id '${id}' not found`
			};
		}

		const totalPrice = await foundBasket.totalPrice;

		foundBasket = foundBasket.toObject();
		foundBasket.totalPrice = totalPrice;

		foundBasket.items.forEach(i => delete i._id);

		const bookTypes = ['Книга', 'Електронна книга', 'Аудіокнига'];
		let product;
		let productType;
		let specificProductId;
		let book;

		for (let item of foundBasket.items) {
			product = item.product;
			productType = product.type.name;
			specificProductId = product.specificProduct;
			delete product.specificProduct;

			product.image = product.images[0];
			delete product.images;

			if (bookTypes.includes(productType)) {
				book = await Book.findById(specificProductId)
					.populate({ path: 'authors', select: 'fullName' })
					.select('type authors')
					.lean();

				product.authors = book.authors.map(a => a.fullName);
				product.type = book.type;
			}
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
