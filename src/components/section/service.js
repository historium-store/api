import validator from 'validator';
import Product from '../product/model.js';
import Section from './model.js';

const createOne = async sectionData => {
	let { name, sections } = sectionData;
	sections = sections ?? [];

	try {
		const existingSection = await Section.where('name')
			.equals(name)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (existingSection) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
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

		return await Section.create(sectionData);
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
		select:
			'name creators key price quantity createdAt code images requiresDelivery',
		transform: product => ({
			...product,
			image: product.image ?? product.images[0],
			images: undefined
		})
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
		order,
		name
	} = queryParams;

	try {
		const query = Section.where('deletedAt').exists(false);

		if (name) {
			query.where('name').equals(name);
		}

		const foundSections = await query
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
	const { name, sections } = changes;

	try {
		const isMongoId = validator.isMongoId(id);

		const sectionToUpdate = await Section.where(
			isMongoId ? '_id' : 'key'
		)
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.select('_id')
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
			const existingSection = await Section.where('name')
				.equals(name)
				.where('deletedAt')
				.exists(false)
				.select('_id')
				.findOne()
				.lean();

			if (existingSection) {
				throw {
					status: 409,
					message: `Section with name '${name}' already exists`
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
			.select('products')
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
				message: "Can't delete section with products in it"
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
			.populate('sections')
			.select('sections')
			.findOne();

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

		const products = await Product.where('sections')
			.in(sectionIds)
			.where('deletedAt')
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
					...product.toObject(),
					image: product.images[0],
					images: undefined
				}))
			);

		return {
			result: products,
			total: products.length
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
