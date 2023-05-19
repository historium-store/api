import {
	Book,
	Product,
	ProductType,
	Section
} from '../models/index.js';

const createOne = async productData => {
	try {
		// TODO: хранить последний использованный код в базе (триггер)
		const codes = (await Product.find({})).map(p => +p.code);
		const code = codes.length
			? `${Math.max(...codes) + 1}`
			: '100000';
		productData.code = code;

		if (!(await ProductType.findById(productData.type))) {
			throw {
				status: 404,
				message: `Product type with id '${productData.type}' not found`
			};
		}

		const sections = [];
		for (const sectionId of productData.sections) {
			const section = await Section.findById(sectionId);

			if (!section) {
				throw {
					status: 404,
					message: `Section with id '${sectionId}' not found`
				};
			}

			sections.push(section);
		}

		productData.reviews = [];

		const product = await Product.create(productData);

		sections.forEach(s => {
			s.products.push(product.id);
			s.save();
		});

		return product;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const product = await Product.findById(id).populate([
			'type',
			'sections'
		]);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Product.find({}).populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const product = await Product.findById(id);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		if (changes.sections) {
			const sections = [];
			for (const sectionId of changes.sections) {
				const section = await Section.findById(sectionId);

				if (!section) {
					throw {
						status: 404,
						message: `Section with id '${sectionId}' not found`
					};
				}

				sections.push(section);
			}

			const added = sections.filter(
				s => !product.sections.includes(s.id)
			);
			await Section.updateMany(
				{ _id: added },
				{ $addToSet: { products: product.id } }
			);

			const removed = product.sections
				.map(s => `${s}`)
				.filter(s => !sections.map(s => s.id).includes(s));
			await Section.updateMany(
				{ _id: removed },
				{ $pull: { products: product.id } }
			);
		}

		return await Product.findByIdAndUpdate(id, changes, {
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
		const product = await Product.findByIdAndDelete(id);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		await Section.updateMany(
			{ _id: product.sections },
			{ $pull: { products: product.id } }
		);

		await Book.deleteOne({ product: product.id });

		return product;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
