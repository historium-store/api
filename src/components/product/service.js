import ProductType from '../product-type/model.js';
import Review from '../review/model.js';
import Section from '../section/model.js';
import Product from './model.js';

const createOne = async productData => {
	let { type, sections, reviews } = productData;
	sections = sections ?? [];
	reviews = reviews ?? [];

	try {
		const existingProductType = await ProductType.exists({
			_id: type,
			deletedAt: { $exists: false }
		});

		if (!existingProductType) {
			throw {
				status: 404,
				message: `Product type with id '${type}' not found`
			};
		}

		let notFoundIndex = (
			await Section.find({ _id: sections })
		).findIndex(s => !s || s.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Section with id '${sections[notFoundIndex]}' not found`
			};
		}

		notFoundIndex = (
			await Review.find({
				_id: reviews
			})
		).findIndex(r => !r || r.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Review with id '${reviews[notFoundIndex]}' not found`
			};
		}

		const newProduct = await Product.create(productData);

		await Section.updateMany(
			{ _id: sections },
			{ $push: { products: newProduct.id } }
		);

		await Review.updateMany(
			{ _id: reviews },
			{ $set: { product: newProduct.id } }
		);

		return newProduct;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundProduct = await Product.findById(id);

		if (!foundProduct || foundProduct.deletedAt) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return foundProduct;
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
		return await Product.find({
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
	const { type, sections, reviews } = changes;

	try {
		const productToUpdate = await Product.findById(id);

		if (!productToUpdate || productToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		if (type) {
			const existingProductType = await ProductType.exists({
				_id: type,
				deletedAt: { $exists: false }
			});

			if (!existingProductType) {
				throw {
					status: 404,
					message: `Product type with id '${type}' not found`
				};
			}
		}

		let addedSectionIds = [];
		let removedSectionIds = [];
		if (sections) {
			const notFoundIndex = (
				await Section.find({ _id: sections })
			).findIndex(s => !s || s.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Section with id '${sections[notFoundIndex]}' not found`
				};
			}

			const oldSectionIds = productToUpdate.sections.map(s =>
				s.id.toString('hex')
			);

			addedSectionIds = sections.filter(
				s => !oldSectionIds.includes(s)
			);

			removedSectionIds = oldSectionIds.filter(
				s => !sections.includes(s)
			);
		}

		let addedReviewIds = [];
		let removedReviewIds = [];
		if (reviews) {
			const notFoundIndex = (
				await Review.find({ _id: reviews })
			).findIndex(r => !r || r.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Review with id '${reviews[notFoundIndex]}' not found`
				};
			}

			const oldReviewIds = productToUpdate.reviews.map(s =>
				s.id.toString('hex')
			);

			addedReviewIds = reviews.filter(s => !oldReviewIds.includes(s));

			removedReviewIds = oldReviewIds.filter(
				s => !reviews.includes(s)
			);
		}

		await Section.updateMany(
			{ _id: addedSectionIds },
			{ $push: { products: productToUpdate.id } }
		);
		await Section.updateMany(
			{ _id: removedSectionIds },
			{ $pull: { products: productToUpdate.id } }
		);

		await Review.updateMany(
			{ _id: addedReviewIds },
			{ $set: { product: productToUpdate.id } }
		);
		await Review.updateMany(
			{ _id: removedReviewIds },
			{ $unset: { product: true } }
		);

		await productToUpdate.updateOne(changes);

		return await Product.findByIdAndUpdate(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const productToDelete = await Product.findById(id);

		if (!productToDelete || productToDelete.deletedAt) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		await Section.updateMany(
			{ _id: productToDelete.sections },
			{ $pull: { products: productToDelete.id } }
		);

		await productToDelete.deleteOne();

		return productToDelete;
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
