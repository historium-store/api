import { Product, Section } from '../models/index.js';
import productTypeService from './productTypeService.js';
import sectionService from './sectionService.js';

const createOne = async productData => {
	const { type, sections } = productData;

	try {
		// TODO: хранить последний использованный код в базе (триггер)
		const codes = (await Product.find({})).map(p => +p.code);
		const code = codes.length
			? `${Math.max(...codes) + 1}`
			: '100000';
		productData.code = code;

		await productTypeService.getOne(type);

		for (let section of sections) {
			await sectionService.getOne(section);
		}

		const newProduct = await Product.create(productData);

		await Section.updateMany(
			{ _id: sections },
			{ $push: { products: newProduct.id } }
		);

		return await Product.findById(newProduct.id).populate([
			'type',
			'sections'
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
		if (!(await Product.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return await Product.findById(id).populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Product.find().populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { type, sections } = changes;

	try {
		const productToUpdate = await Product.findById(id);

		if (!productToUpdate) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		if (type) {
			await productTypeService.getOne(type);
		}

		if (sections) {
			const oldSectionIds = productToUpdate.sections.map(s =>
				s.id.toString('hex')
			);
			const newSectionIds = [];
			for (let section of sections) {
				newSectionIds.push((await sectionService.getOne(section)).id);
			}

			const addedSectionIds = newSectionIds.filter(
				s => !oldSectionIds.includes(s)
			);
			await Section.updateMany(
				{ _id: addedSectionIds },
				{ $push: { products: productToUpdate.id } }
			);

			const removedSectionIds = oldSectionIds.filter(
				s => !newSectionIds.includes(s)
			);
			await Section.updateMany(
				{ _id: removedSectionIds },
				{ $pull: { products: productToUpdate.id } }
			);
		}

		return await Product.findByIdAndUpdate(id, changes, {
			new: true
		}).populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const deletedProduct = await Product.findByIdAndDelete(id);

		if (!deletedProduct) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		await Section.updateMany(
			{ _id: deletedProduct.sections },
			{ $pull: { products: deletedProduct.id } }
		);

		// TODO (мне): нужно продумать как при удалении товара
		// удалять и связанный с ним конкретный товар

		return deletedProduct.populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

// const deleteAll = async () => {
// 	try {
// 		const productsToDelete = await Product.find().populate([
// 			'type',
// 			'sections'
// 		]);

// 		for (let product of productsToDelete) {
// 			await Section.updateMany(
// 				{ _id: product.sections },
// 				{ $pull: { products: product.id } }
// 			);

// 			await product.deleteOne();
// 		}

// 		return productsToDelete;
// 	} catch (err) {
// 		throw {
// 			status: err.status ?? 500,
// 			message: err.message ?? err
// 		};
// 	}
// };

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne /* ,
	deleteAll */
};
