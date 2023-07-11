import Product from '../product/model.js';
import User from '../user/model.js';
import Review from './model.js';

const createOne = async reviewData => {
	const { product, user } = reviewData;

	try {
		let productToUpdate;
		let userToUpdate;

		await Promise.all([
			(async () => {
				productToUpdate = await Product.where('_id')
					.equals(product)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne();

				if (!productToUpdate) {
					throw {
						status: 404,
						message: `Product with id '${product}' not found`
					};
				}
			})(),
			(async () => {
				userToUpdate = await User.where('_id')
					.equals(user)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne();

				if (!userToUpdate) {
					throw {
						status: 404,
						message: `User with id '${user}' not found`
					};
				}
			})()
		]);

		const newReview = await Review.create(reviewData);

		await productToUpdate.updateOne({
			$push: { reviews: newReview.id }
		});

		await userToUpdate.updateOne({
			$push: { reviews: newReview.id }
		});

		return newReview;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const reviewToUpdate = await Review.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!reviewToUpdate) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		Object.keys(changes).forEach(
			key => (reviewToUpdate[key] = changes[key])
		);

		return await reviewToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const reviewToDelete = await Review.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.select('product user')
			.findOne();

		if (!reviewToDelete) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		await Product.updateOne(
			{ _id: reviewToDelete.product },
			{ $pull: { reviews: reviewToDelete.id } }
		);

		await User.updateOne(
			{ _id: reviewToDelete.user },
			{ $pull: { reviews: reviewToDelete.id } }
		);

		await reviewToDelete.deleteOne();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne,
	updateOne,
	deleteOne
};
