import Product from '../product/model.js';
import Section from './model.js';

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

		const notFoundIndex = (
			await Product.find({ _id: products })
		).findIndex(p => !p);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Product with id '${products[notFoundIndex]}' not found`
			};
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
			const notFoundIndex = (
				await Product.find({ _id: products })
			).findIndex(p => !p);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Product with id '${products[notFoundIndex]}' not found`
				};
			}

			const oldProductIds = sectionToUpdate.products.map(p =>
				p.id.toString('hex')
			);

			const addedProductIds = products.filter(
				p => !oldProductIds.includes(p)
			);
			await Product.updateMany(
				{ _id: addedProductIds },
				{ $push: { sections: sectionToUpdate.id } }
			);

			const removedProductIds = oldProductIds.filter(
				p => !products.includes(p)
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
