import CartItem from '../cart-item/model.js';
import Product from '../product/model.js';
import Cart from './model.js';

const getByIdFromToken = async id => {
	try {
		const foundCart = await Cart.findById(id)
			.populate({
				path: 'items',
				select: 'product quantity createdAt'
			})
			.select('-_id items')
			.lean();

		if (!foundCart) {
			throw {
				status: 404,
				message: `Cart with id '${id}' not found`
			};
		}

		await Promise.all(
			foundCart.items.map(async i => {
				const product = await Product.findById(i.product)
					.populate([
						{ path: 'type', select: '-_id name key' },
						{
							path: 'specificProduct',
							model: i.product.model,
							populate: { path: 'authors', select: '-_id fullName' },
							select: '-_id authors'
						}
					])
					.select(
						'name key price quantity images createdAt code requiresDelivery'
					)
					.lean();

				i.product = {
					_id: product._id,
					name: product.name,
					key: product.key,
					price: product.price,
					quantity: product.quantity,
					type: product.type,
					createdAt: product.createdAt,
					code: product.code,
					image: product.images[0],
					authors: product.specificProduct.authors?.map(
						a => a.fullName
					)
				};
			})
		);

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

		await CartItem.deleteMany({ cart });
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

		await Promise.all(
			items.map(async i => {
				const existingProduct = await Product.where('_id')
					.equals(i.product)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingProduct) {
					throw {
						status: 404,
						message: `Product with id '${i.product}' not found`
					};
				}
			})
		);

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

export default {
	getByIdFromToken,
	clearItems,
	merge
};
