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
			dislikes: 0
			//date: Math.floor(Date.now() / 1000)
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

const getOne = async id => {
	try {
		if (!(await Review.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		return Review.findById(id).populate([
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

const getAll = async () => {
	try {
		return await Review.find().populate([
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

const updateOne = async (id, changes) => {
	const { product, user } = changes;

	try {
		const reviewToUpdate = await Review.findById(id);

		if (!reviewToUpdate) {
			throw {
				status: 404,
				message: `Review with id '${id}' not found`
			};
		}

		let oldProduct;
		let newProduct;
		if (product) {
			if (!(await Product.exists({ _id: product }))) {
				throw {
					status: 404,
					message: `Product with id '${product}' not found`
				};
			}

			oldProduct = await Product.findById(reviewToUpdate.product);
			newProduct = await Product.findById(product);
		}

		let oldUser;
		let newUser;
		if (user) {
			if (!(await User.exists({ _id: user }))) {
				throw {
					status: 404,
					message: `User with id '${user}' not found`
				};
			}

			oldUser = await User.findById(reviewToUpdate.user);
			newUser = await User.findById(user);
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

		return await Review.findByIdAndUpdate(id, changes, {
			new: true
		}).populate([
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

const deleteOne = async id => {
	try {
		const reviewToDelete = await Review.findById(id);

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

		return reviewToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
