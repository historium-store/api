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
			});

		await Promise.all(
			foundProducts.map(
				async p =>
					await p.populate({
						path: 'specificProduct',
						model: p.model,
						populate: 'authors'
					})
			)
		);

		return {
			result: foundProducts.map(p => ({
				_id: p.id,
				name: p.name,
				key: p.key,
				price: p.price,
				quantity: p.quantity,
				type: p.type,
				createdAt: p.createdAt,
				code: p.code,
				image: p.images[0],
				authors: p.specificProduct.authors?.map(a => a.fullName)
			})),
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
