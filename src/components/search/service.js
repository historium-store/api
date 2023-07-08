import Product from '../product/model.js';

const findProducts = async valueToFind => {
	try {
		const foundProducts = await Product.where('deletedAt')
			.exists(false)
			.or([
				{ name: { $regex: valueToFind, $options: 'i' } },
				{ code: valueToFind }
			])
			.populate({
				path: 'type',
				select: '-_id name key'
			})
			.select(
				'name creators key price quantity createdAt code images requiresDelivery'
			)
			.transform(result =>
				result.map(product => ({
					...product,
					image: product.images[0],
					images: undefined
				}))
			)
			.lean();

		return {
			result: foundProducts,
			total: foundProducts.length
		};
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	findProducts
};
