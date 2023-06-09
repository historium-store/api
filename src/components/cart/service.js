import Book from '../book/model.js';
import CartItem from '../cart-item/model.js';
import Cart from './model.js';

const getByIdFromToken = async id => {
	try {
		let foundCart = await Cart.findById(id)
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

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${id}' not found`
			};
		}

		const totalPrice = await foundCart.totalPrice;

		foundCart = foundCart.toObject();
		foundCart.totalPrice = totalPrice;

		foundCart.items.forEach(i => delete i._id);

		const bookTypes = ['Книга', 'Електронна книга', 'Аудіокнига'];
		let product;
		let productType;
		let specificProductId;
		let book;

		for (let item of foundCart.items) {
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

		foundCart.totalQuantity = foundCart.items.reduce(
			(sum, item) => sum + item.quantity,
			0
		);

		return foundCart;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const clearItems = async cart => {
	try {
		const foundCart = await Cart.findById(cart);

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${id}' not found`
			};
		}

		await CartItem.deleteMany({ _id: foundCart.items });

		await foundCart.updateOne({ items: [] });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { getByIdFromToken, clearItems };
