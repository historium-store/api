import Product from '../product/model.js';
import User from '../user/model.js';
import Review from './model.js';

const createOne = async reviewData => {
	const { product, user } = reviewData;

	try {
		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const existingUser = await User.where('_id')
			.equals(user)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!existingUser) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const newReview = await Review.create(reviewData);

		await Product.updateOne(
			{ _id: product },
			{ $push: { reviews: newReview } }
		);

		await User.updateOne(
			{ _id: user },
			{ $push: { reviews: newReview } }
		);

		return newReview;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundReview = await Review.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundReview) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		return foundReview;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		return await Review.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });
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
	getOne,
	getAll,
	updateOne,
	deleteOne
};
