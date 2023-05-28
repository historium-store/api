import Product from '../product/model.js';

const findProducts = async valueToFind => {
	return await Product.find().where({
		$or: [
			{ name: { $regex: valueToFind, $options: 'i' } },
			{ code: valueToFind }
		]
	});
};

export default { findProducts };
