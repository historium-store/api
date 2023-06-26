import validator from 'validator';
import { getProductCode } from '../../triggers/product-code.js';
import { transliterateToKey } from '../../utils.js';
import Book from '../book/model.js';
import ProductType from '../product-type/model.js';
import Section from '../section/model.js';
import Product from './model.js';

const createOne = async productData => {
	let { name, key, type, sections } = productData;

	try {
		const productTypeExists = await ProductType.where('_id')
			.equals(type)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!productTypeExists) {
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
					.findOne();

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
			productData.key += `-${await getProductCode()}`;
		}

		const newProduct = await Product.create(productData);

		await Section.updateMany(
			{ _id: sections },
			{ $push: { products: newProduct } }
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
			.findOne()
			.populate({ path: 'type', select: 'name key' });

		if (!foundProduct) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		if (preview) {
			await foundProduct.populate({
				path: 'specificProduct',
				model: foundProduct.model,
				populate: {
					path: 'authors',
					select: 'fullName'
				},
				select: 'authors'
			});

			return {
				_id: foundProduct.id,
				name: foundProduct.name,
				key: foundProduct.key,
				price: foundProduct.price,
				quantity: foundProduct.quantity,
				type: foundProduct.type,
				createdAt: foundProduct.createdAt,
				code: foundProduct.code,
				image: foundProduct.images[0],
				authors: foundProduct.specificProduct.authors?.map(
					a => a.fullName
				)
			};
		}

		await foundProduct.populate({
			path: 'specificProduct',
			model: foundProduct.model,
			populate: [
				{ path: 'publisher', select: 'name' },
				{
					path: 'authors',
					select: 'fullName pictures biography'
				},
				{ path: 'compilers', select: 'fullName' },
				{ path: 'translators', select: 'fullName' },
				{ path: 'illustrators', select: 'fullName' },
				{ path: 'editors', select: 'fullName' },
				{ path: 'series', select: 'name' }
			],
			select: '-product'
		});

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
			.populate({ path: 'type', select: 'name key' });

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

		return {
			result: foundProducts.map(p => ({
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
			})),
			total: await Product.countDocuments()
		};
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { key, type, sections } = changes;

	try {
		const isMongoId = validator.isMongoId(id);

		const productToUpdate = await Product.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne()
			.populate({ path: 'type', select: 'name key' });

		if (!productToUpdate) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		if (key && productToUpdate.key !== key) {
			const productExists = await Product.exists({ key });

			if (productExists) {
				changes.key = `${key}-${productToUpdate.code}`;
			}
		}

		if (type) {
			const existingProductType = await ProductType.where('_id')
				.equals(id)
				.where('deletedAt')
				.exists(false)
				.findOne();

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
						.findOne();

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

const deleteOne = async id => {
	try {
		const isMongoId = validator.isMongoId(id);

		const productToDelete = await Product.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne()
			.populate({ path: 'type', select: 'name key' });

		if (!productToDelete) {
			throw {
				status: 404,
				message: `Product with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		await Section.updateMany(
			{ _id: productToDelete.sections },
			{ $pull: { products: productToDelete.id } }
		);

		if (productToDelete.model === 'Book') {
			await Book.deleteOne(productToDelete.specificProduct);
		}

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
