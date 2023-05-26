import Product from '../product/model.js';
import User from '../user/model.js';
import Review from './model.js';

const createOne = async reviewData => {
	const { product, user } = reviewData;

	try {
		if (!(await Product.exists({ _id: product }))) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		if (!(await User.exists({ _id: user }))) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const newReview = await Review.create({
			...reviewData,
			likes: 0,
			dislikes: 0,
			date: Math.floor(Date.now() / 1000)
		});

		await Product.updateOne(
			{ _id: product },
			{ $push: { reviews: newReview.id } }
		);

		await User.updateOne(
			{ _id: user },
			{ $push: { reviews: newReview.id } }
		);

		return await Review.findById(newReview.id).populate([
			{
				path: 'product',
				populate: ['type', 'sections']
			},
			'user'
		]);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
