import CartItem from '../cart-item/model.js';
import Product from '../product/model.js';
import Cart from './model.js';

const getByIdFromToken = async id => {
	try {
		let foundCart = await Cart.findById(id)
			.populate({
				path: 'items',
				select: '-_id product quantity createdAt'
			})
			.select('-_id items')
			.lean();

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${id}' not found`
			};
		}

		const productIds = foundCart.items.map(i => i.product);
		const products = await Product.find({ _id: productIds })
			.populate({ path: 'type', select: '-_id name key' })
			.select(
				'name key price quantity images createdAt code specificProduct model'
			);

		await Promise.all(
			products.map(
				async p =>
					await p.populate({
						path: 'specificProduct',
						model: p.model,
						populate: {
							path: 'authors',
							select: 'fullName'
						},
						select: 'authors'
					})
			)
		);

		for (let i = 0; i < products.length; ++i) {
			foundCart.items[i].product = {
				_id: products[i].id,
				name: products[i].name,
				key: products[i].key,
				price: products[i].price,
				quantity: products[i].quantity,
				type: products[i].type,
				createdAt: products[i].createdAt,
				code: products[i].code,
				image: products[i].images[0],
				authors: products[i].specificProduct.authors?.map(
					a => a.fullName
				)
			};
		}

		foundCart.totalPrice = foundCart.items.reduce(
			(acc, item) => acc + item.product.price * item.quantity,
			0
		);

		foundCart.totalQuantity = foundCart.items.reduce(
			(acc, item) => acc + item.quantity,
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

		await CartItem.deleteMany();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const merge = async (items, cart) => {
	try {
		const foundCart = await Cart.findById(cart);

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${id}' not found`
			};
		}

		let existingItem;
		let newCartItem;
		for (let item of items) {
			existingItem = await CartItem.findOne({
				cart,
				product: item.product
			});

			if (existingItem) {
				await existingItem.updateOne({
					$inc: { quantity: item.quantity }
				});

				continue;
			}

			newCartItem = await CartItem.create({ ...item, cart });

			await foundCart.updateOne({
				$push: { items: newCartItem }
			});
		}

		return await getByIdFromToken(cart);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { getByIdFromToken, clearItems, merge };
