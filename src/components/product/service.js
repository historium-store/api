import validator from 'validator';
import { transliterateToKey } from '../../utils.js';
import Book from '../book/model.js';
import ProductType from '../product-type/model.js';
import Section from '../section/model.js';
import User from '../user/model.js';
import Product from './model.js';

const createOne = async productData => {
	let { name, key, type, sections, seller } = productData;

	try {
		const existingProductType = await ProductType.where('_id')
			.equals(type)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (!existingProductType) {
			throw {
				status: 404,
				message: `Product type with id '${type}' not found`
			};
		}

		await Promise.all(
			sections.map(async id => {
				const existingSection = await Section.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.select('_id')
					.findOne()
					.lean();

				if (!existingSection) {
					throw {
						status: 404,
						message: `Section with id '${id}' not found`
					};
				}
			})
		);

		if (!key) {
			productData.key = key = transliterateToKey(name);
		}

		const productExists = await Product.exists({ key });

		if (productExists) {
			const { currentCode } = await mongoose.connection
				.collection('product_code_counter')
				.findOne();

			productData.key += `-${currentCode}`;
		}

		const newProduct = await Product.create(productData);

		await Section.updateMany(
			{ _id: sections },
			{ $push: { products: newProduct.id } }
		);

		await User.updateOne(
			{ _id: seller },
			{ $push: { products: newProduct.id } }
		);

		return newProduct;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async (id, preview) => {
	try {
		const isMongoId = validator.isMongoId(id);

		const foundProduct = await Product.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.populate({ path: 'type', select: '-_id name key' })
			.transform(product => {
				if (preview) {
					return {
						_id: product._id,
						name: product.name,
						creators: product.creators,
						key: product.key,
						price: product.price,
						quantity: product.quantity,
						type: {
							name: product.type.name,
							key: product.type.key
						},
						createdAt: product.createdAt,
						code: product.code,
						image: product.image ?? product.images[0],
						requiresDelivery: product.requiresDelivery
					};
				}

				return product;
			})
			.findOne()
			.lean();

		if (!foundProduct) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
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
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		const foundProducts = await Product.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.populate({ path: 'type', select: '-_id name key' })
			.select(
				'name creators key price quantity createdAt code images requiresDelivery'
			)
			.transform(result =>
				result.map(product => ({
					...product,
					image: product.images[0],
					images: undefined
				}))
			)
			.lean();

		return {
			result: foundProducts,
			total: await Product.countDocuments()
		};
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes, seller) => {
	const { key, type, sections } = changes;

	try {
		const isMongoId = validator.isMongoId(id);

		const productToUpdate = await Product.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!productToUpdate) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		const foundSeller = await User.where('_id')
			.equals(seller)
			.where('deletedAt')
			.exists(false)
			.select('-_id role products')
			.findOne()
			.lean();
		const isAdmin = foundSeller.role === 'admin';
		const productOwner = foundSeller.products
			.map(p => p.toHexString())
			.includes(productToUpdate.id.toString('hex'));

		if (!isAdmin && !productOwner) {
			throw {
				status: 403,
				message: "Can't update product from other seller"
			};
		}

		if (key && productToUpdate.key !== key) {
			const productExists = await Product.exists({ key });

			if (productExists) {
				const { currentCode } = await mongoose.connection
					.collection('product_code_counter')
					.findOne();

				productData.key += `-${currentCode}`;
			}
		}

		if (type) {
			const existingProductType = await ProductType.where('_id')
				.equals(type)
				.where('deletedAt')
				.exists(false)
				.select('_id')
				.findOne()
				.lean();

			if (!existingProductType) {
				throw {
					status: 404,
					message: `Product type with id '${type}' not found`
				};
			}
		}

		if (sections) {
			await Promise.all(
				sections.map(async id => {
					const existingSection = await Section.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.select('_id')
						.findOne()
						.lean();

					if (!existingSection) {
						throw {
							status: 404,
							message: `Section with id '${id}' not found`
						};
					}
				})
			);

			const oldSectionIds = productToUpdate.sections.map(s =>
				s.toHexString()
			);
			const addedSectionIds = sections.filter(
				s => !oldSectionIds.includes(s)
			);
			const removedSectionIds = oldSectionIds.filter(
				s => !sections.includes(s)
			);

			await Section.updateMany(
				{ _id: addedSectionIds },
				{ $push: { products: productToUpdate.id } }
			);

			await Section.updateMany(
				{ _id: removedSectionIds },
				{ $pull: { products: productToUpdate.id } }
			);
		}

		Object.keys(changes).forEach(
			key => (productToUpdate[key] = changes[key])
		);

		return await productToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async (id, seller) => {
	try {
		const isMongoId = validator.isMongoId(id);

		const productToDelete = await Product.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!productToDelete) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		const foundSeller = await User.where('_id')
			.equals(seller)
			.where('deletedAt')
			.exists(false)
			.select('-_id role products')
			.findOne()
			.lean();
		const isAdmin = foundSeller.role === 'admin';
		const productOwner = foundSeller.products
			.map(p => p.toHexString())
			.includes(productToDelete.id.toString('hex'));

		if (!isAdmin && !productOwner) {
			throw {
				status: 403,
				message: "Can't update product from other seller"
			};
		}

		await Section.updateMany(
			{ _id: productToDelete.sections },
			{ $pull: { products: productToDelete.id } }
		);

		await Book.deleteOne({ product: productToDelete.id });

		await productToDelete.deleteOne();
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
