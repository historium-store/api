import Book from '../book/model.js';
import Product from '../product/model.js';

const findProducts = async valueToFind => {
	const productIds = (
		await Product.find().where({
			$or: [
				{ name: { $regex: valueToFind, $options: 'i' } },
				{ code: valueToFind }
			]
		})
	).map(p => p.id);

	return await Book.find({ product: productIds })
		.populate([
			'publisher',
			'series',
			'authors',
			'compilers',
			'translators',
			'illustrators',
			'editors'
		])
		.populate({
			path: 'product',
			populate: ['type', 'sections']
		});
};

export default { findProducts };
