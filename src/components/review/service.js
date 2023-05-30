import Product from '../product/model.js';
import User from '../user/model.js';
import Review from './model.js';

const createOne = async reviewData => {
	const { product, user } = reviewData;

	try {
		const existingProduct = await Product.exists({
			_id: product,
			deletedAt: { $exists: false }
		});

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const existingUser = await User.exists({
			_id: user,
			deletedAt: { $exists: false }
		});

		if (!existingUser) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const newReview = await Review.create({
			...reviewData,
			likes: 0,
			dislikes: 0
		});

		await Product.updateOne(
			{ _id: product },
			{ $push: { reviews: newReview.id } }
		);

		await User.updateOne(
			{ _id: user },
			{ $push: { reviews: newReview.id } }
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
		const foundReview = await Review.findById(id);

		if (!foundReview || foundReview.deletedAt) {
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
	const { limit, offset: skip } = queryParams;

	try {
		return await Review.find({
			deletedAt: { $exists: false }
		})
			.limit(limit)
			.skip(skip);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { product, user } = changes;

	try {
		const reviewToUpdate = await Review.findById(id);

		if (!reviewToUpdate || reviewToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		let oldProduct;
		let newProduct;
		if (product) {
			newProduct = await Product.findById(product);
			if (!newProduct || newProduct.deletedAt) {
				throw {
					status: 404,
					message: `Product with id '${product}' not found`
				};
			}

			oldProduct = await Product.findById(reviewToUpdate.product);
		}

		let oldUser;
		let newUser;
		if (user) {
			const newUser = await User.findById(user);
			if (!newUser || newUser.deletedAt) {
				throw {
					status: 404,
					message: `User with id '${user}' not found`
				};
			}

			oldUser = await User.findById(reviewToUpdate.user);
		}

		if (product && newProduct.id !== oldProduct.id) {
			await newProduct.updateOne({
				$push: { reviews: reviewToUpdate.id }
			});
			await oldProduct.updateOne({
				$pull: { reviews: reviewToUpdate.id }
			});
		}

		if (user && newUser.id !== oldUser.id) {
			await newUser.updateOne({
				$push: { reviews: reviewToUpdate.id }
			});
			await oldUser.updateOne({
				$pull: { reviews: reviewToUpdate.id }
			});
		}

		await reviewToUpdate.updateOne(changes);

		return await Review.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const reviewToDelete = await Review.findById(id);

		if (!reviewToDelete || reviewToDelete.deletedAt) {
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

		return reviewToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
