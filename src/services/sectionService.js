import { Product, Section } from '../models/index.js';
import productService from './productService.js';

const createOne = async sectionData => {
	let { name, products } = sectionData;
	products = products ?? [];

	try {
		if (await Section.exists({ name })) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
			};
		}

		for (let product of products) {
			await productService.getOne(product);
		}

		const newSection = await Section.create(sectionData);

		await Product.updateMany(
			{ _id: products },
			{ $push: { sections: newSection.id } }
		);

		return await Section.findById(newSection.id)
			.populate('sections')
			.populate({
				path: 'products',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		if (!(await Section.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return await Section.findById(id)
			.populate('sections')
			.populate({
				path: 'products',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Section.find()
			.populate('sections')
			.populate({
				path: 'products',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { name, products } = changes;

	try {
		const sectionToUpdate = await Section.findById(id);

		if (!sectionToUpdate) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		if (await Section.exists({ name })) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
			};
		}

		if (products) {
			const oldProductIds = sectionToUpdate.products.map(p =>
				p.id.toString('hex')
			);
			const newProductIds = [];
			for (let product of products) {
				newProductIds.push((await productService.getOne(product)).id);
			}

			const addedProductIds = newProductIds.filter(
				p => !oldProductIds.includes(p)
			);
			await Product.updateMany(
				{ _id: addedProductIds },
				{ $push: { sections: sectionToUpdate.id } }
			);

			const removedProductIds = oldProductIds.filter(
				p => !newProductIds.includes(p)
			);
			await Product.updateMany(
				{ _id: removedProductIds },
				{ $pull: { sections: sectionToUpdate.id } }
			);
		}

		return await Section.findByIdAndUpdate(id, changes, {
			new: true
		})
			.populate('sections')
			.populate({
				path: 'products',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const sectionToDelete = await Section.findById(id);

		if (!sectionToDelete) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		if (sectionToDelete.products.length) {
			throw {
				status: 400,
				message: "Can't delete a section with products in it"
			};
		}

		return await Section.findByIdAndDelete(id)
			.populate('sections')
			.populate({
				path: 'products',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
