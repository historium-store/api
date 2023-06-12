import Product from '../product/model.js';

const findProducts = async valueToFind => {
	try {
		const foundProducts = await Product.find({
			$or: [
				{
					name: { $regex: valueToFind, $options: 'i' },
					deletedAt: { $exists: false }
				},
				{
					code: valueToFind,
					deletedAt: { $exists: false }
				}
			]
		}).populate([{ path: 'type', select: '-_id name key' }]);

		await Promise.all(
			foundProducts.map(
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

		const productPreviews = foundProducts.map(p => ({
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
		}));

		return {
			result: productPreviews,
			total: productPreviews.length
		};
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { findProducts };
