import { Product, Section } from '../models/index.js';
import productService from './productService.js';

const createOne = async sectionData => {
	const { name } = sectionData;

	if (await Section.exists({ name })) {
		throw {
			status: 409,
			message: `Section with name '${name}' already exists`
		};
	}

	try {
		const newSection = await Section.create(sectionData);

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
		if (!Section.exists({ _id: id })) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return Section.findById(id)
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
	try {
		const sectionToUpdate = await Section.findById(id);

		if (!sectionToUpdate) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		const { name } = changes;

		if (await Section.exists({ name })) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
			};
		}

		if (changes.products) {
			const products = [];
			changes.products.forEach(p =>
				products.push(productService.getOne(p))
			);

			const added = products.filter(
				p => !sectionToUpdate.products.includes(p.id)
			);
			await Product.updateMany(
				{ _id: added },
				{ $addToSet: { sections: sectionToUpdate.id } }
			);

			const removed = sectionToUpdate.products
				.map(s => `${s}`)
				.filter(p => !products.map(p => p.id).includes(p));
			await Product.updateMany(
				{ _id: removed },
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
