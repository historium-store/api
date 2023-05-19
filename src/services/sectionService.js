import { Product, Section } from '../models/index.js';

const createOne = async sectionData => {
	const exists =
		(await Section.findOne({ name: sectionData.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Section with name '${sectionData.name}' already exists`
		};
	}

	sectionData.products = [];

	try {
		return await Section.create(sectionData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const section = await Section.findById(id);

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		return section;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Section.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const exists =
		(await Section.findOne({ name: changes.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Section with name '${changes.name}' already exists`
		};
	}

	try {
		const section = await Section.findById(id);

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		if (changes.products) {
			const products = [];
			for (const productId of changes.products) {
				const product = await Product.findById(productId);

				if (!product) {
					throw {
						status: 404,
						message: `Product with id '${productId}' not found`
					};
				}

				products.push(product);
			}

			const added = products.filter(
				p => !section.products.includes(p.id)
			);
			await Product.updateMany(
				{ _id: added },
				{ $addToSet: { sections: section.id } }
			);

			const removed = section.products
				.map(s => `${s}`)
				.filter(p => !products.map(p => p.id).includes(p));
			await Product.updateMany(
				{ _id: removed },
				{ $pull: { sections: section.id } }
			);
		}

		return await Section.findByIdAndUpdate(id, changes, {
			new: true
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
		const section = await Section.findById(id);

		if (!section) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		if (section.products.length) {
			throw {
				status: 400,
				message: `Can't delete a section with products in it`
			};
		}

		await section.deleteOne();

		return section;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
