import validator from 'validator';
import Product from '../product/model.js';
import Section from './model.js';

const checkSectionExistense = async name => {
	const sectionExists = await Section.where('name')
		.equals(name)
		.where('deletedAt')
		.exists(false)
		.findOne();

	if (sectionExists) {
		throw {
			status: 409,
			message: `Section with name '${name}' already exists`
		};
	}
};

const createOne = async sectionData => {
	let { name, products } = sectionData;
	products = products ?? [];

	try {
		await checkSectionExistense(name);

		await Promise.all(
			products.map(async id => {
				const existingProduct = await Product.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingProduct) {
					throw {
						status: 404,
						message: `Product with id '${id}' not found`
					};
				}
			})
		);

		const newSection = await Section.create(sectionData);

		await Product.updateMany(
			{ _id: products },
			{ $push: { sections: newSection } }
		);

		return newSection;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const populateNestedSections = async (section, withProducts) => {
	await section.populate(
		'sections',
		`-createdAt -updatedAt ${withProducts ? '' : '-products'}`
	);

	if (section.sections.length) {
		await Promise.all(
			section.sections.map(async s => {
				await populateNestedSections(s, withProducts);
			})
		);
	}
};

const populateNestedProducts = async section => {
	await section.populate('products');

	await Promise.all(
		section.products.map(
			async p =>
				await p.populate({
					path: 'specificProduct',
					model: p.model,
					populate: 'authors'
				})
		)
	);

	await section.populate({
		path: 'products',
		populate: { path: 'type', select: '-_id name key' },
		transform: p => {
			return {
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
			};
		}
	});

	if (section.sections.length) {
		await Promise.all(
			section.sections.map(async s => {
				await populateNestedProducts(s);
			})
		);
	}
};

const getOne = async (id, withProducts) => {
	try {
		const isMongoId = validator.isMongoId(id);

		const foundSection = await Section.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne()
			.select(
				`-createdAt -updatedAt ${withProducts ? '' : '-products'}`
			);

		if (!foundSection) {
			throw {
				status: 404,
				message: `Section with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		await populateNestedSections(foundSection, withProducts);

		if (withProducts) {
			await populateNestedProducts(foundSection);
		}

		return foundSection;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const {
		limit,
		offset: skip,
		withProducts,
		orderBy,
		order
	} = queryParams;

	try {
		const foundSections = await Section.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.select(
				`-createdAt -updatedAt ${withProducts ? '' : '-products'}`
			);

		await Promise.all(
			foundSections.map(async s => {
				await populateNestedSections(s, withProducts);

				if (withProducts) {
					await populateNestedProducts(s);
				}
			})
		);

		return foundSections;
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
		const isMongoId = validator.isMongoId(id);

		const sectionToUpdate = await Section.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!sectionToUpdate) {
			throw {
				status: 404,
				message: `Section with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		if (name) {
			await checkSectionExistense(name);
		}

		if (products) {
			await Promise.all(
				products.map(async id => {
					const existingProduct = await Product.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.findOne();

					if (!existingProduct) {
						throw {
							status: 404,
							message: `Product with id '${id}' not found`
						};
					}
				})
			);

			const oldProductIds = sectionToUpdate.products.map(p =>
				p.toHexString()
			);
			const addedProductIds = products.filter(
				p => !oldProductIds.includes(p)
			);
			const removedProductIds = oldProductIds.filter(
				p => !products.includes(p)
			);

			await Product.updateMany(
				{ _id: addedProductIds },
				{ $push: { sections: sectionToUpdate.id } }
			);

			await Product.updateMany(
				{ _id: removedProductIds },
				{ $pull: { sections: sectionToUpdate.id } }
			);
		}

		Object.keys(changes).forEach(
			key => (sectionToUpdate[key] = changes[key])
		);

		return await sectionToUpdate.save();
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

		const sectionToDelete = await Section.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!sectionToDelete) {
			throw {
				status: 404,
				message: `Section with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		if (sectionToDelete.products.length) {
			throw {
				status: 400,
				message: "Can't delete a section with products in it"
			};
		}

		await sectionToDelete.deleteOne();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const gatherSectionIds = sections => {
	return sections.reduce((ids, section) => {
		ids.push(section._id);
		if (section.sections && section.sections.length > 0) {
			const nestedIds = gatherSectionIds(section.sections);
			ids.push(...nestedIds);
		}
		return ids;
	}, []);
};

const getProducts = async (id, queryParams) => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		const isMongoId = validator.isMongoId(id);

		const foundSection = await Section.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne()
			.populate('sections')
			.select('sections');

		if (!foundSection) {
			throw {
				status: 404,
				message: `Section with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		await populateNestedSections(foundSection);

		const sectionIds = [
			foundSection.id.toString('hex'),
			...new Set(
				gatherSectionIds(foundSection.sections).map(id =>
					id.toString('hex')
				)
			)
		];

		const products = await Product.find({
			sections: { $in: sectionIds },
			deletedAt: { $exists: false }
		})
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.populate({ path: 'type', select: '-_id name key' });

		await Promise.all(
			products.map(
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

		const productPreviews = products.map(p => ({
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
		}));

		return {
			result: productPreviews,
			total: productPreviews.length
		};
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
	getProducts
};
