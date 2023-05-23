import { Book, Product, Section } from '../models/index.js';
import productTypeService from './productTypeService.js';
import sectionService from './sectionService.js';

const createOne = async productData => {
	try {
		// TODO: хранить последний использованный код в базе (триггер)
		const codes = (await Product.find({})).map(p => +p.code);
		const code = codes.length
			? `${Math.max(...codes) + 1}`
			: '100000';
		productData.code = code;

		await productTypeService.getOne(productData.type);

		const sections = [];
		for (let section of productData.sections) {
			sections.push(await sectionService.getOne(section));
		}

		const newProduct = await Product.create(productData);

		for (let section of sections) {
			await section.updateOne({ $push: { products: newProduct.id } });
		}

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
		const product = await Product.findById(id);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product.populate(['type', 'sections']);
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
	try {
		const productToUpdate = await Product.findById(id);

		if (!productToUpdate) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		if (changes.sections) {
			const sections = [];
			changes.sections.forEach(async s =>
				sections.push(await sectionService.getOne(s))
			);

			const added = sections.filter(
				s => !productToUpdate.sections.includes(s.id)
			);
			await Section.updateMany(
				{ _id: added },
				{ $addToSet: { products: productToUpdate.id } }
			);

			const removed = productToUpdate.sections
				.map(s => `${s}`)
				.filter(s => !sections.map(s => s.id).includes(s));
			await Section.updateMany(
				{ _id: removed },
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

const deleteAll = async () => {
	try {
		const productsToDelete = await Product.find().populate([
			'type',
			'sections'
		]);

		for (let product of productsToDelete) {
			await Section.updateMany(
				{ _id: product.sections },
				{ $pull: { products: product.id } }
			);

			// TODO (мне): нужно продумать как при удалении товара
			// удалять и связанный с ним конкретный товар

			await product.deleteOne();
		}

		return productsToDelete;
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
	deleteOne,
	deleteAll
};
