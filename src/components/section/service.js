import validator from 'validator';

import Product from '../product/model.js';
import Section from './model.js';

const createOne = async sectionData => {
	let { name, products } = sectionData;
	products = products ?? [];

	try {
		const sectionExists = await Section.exists({
			name,
			deletedAt: { $exists: false }
		});

		if (sectionExists) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
			};
		}

		const notFoundIndex = (
			await Product.find({ _id: products })
		).findIndex(p => !p || p.deletedAt);

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

		return newSection;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const populateRecursively = async (id, withProducts) => {
	const section = await Section.findById(id)
		.select(`-createdAt -updatedAt`)
		.lean();

	if (withProducts) {
		const foundProducts = await Product.find({
			_id: section.products
		}).populate([{ path: 'type', select: '-_id name key' }]);

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

		const productPreviews = foundProducts.map(p => ({
			id: p.id,
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

		section.products = productPreviews;
	}

	const sections = await Promise.all(
		section.sections.map(async s => {
			return await populateRecursively(s, withProducts);
		})
	);

	section.sections = sections;

	return section;
};

const getOne = async (id, withProducts) => {
	try {
		const isMongoId = validator.isMongoId(id);

		const section = await Section.exists({
			...(isMongoId ? { _id: id } : { key: id }),
			deletedAt: { $exists: false }
		});

		if (!section) {
			throw {
				status: 404,
				message: `Section with ${
					isMongoId ? 'id' : 'key'
				} '${id}' not found`
			};
		}

		return await populateRecursively(section, withProducts);
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

	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		const foundSections = await Section.find(filter)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });

		const sectionsToReturn = [];

		for (let section of foundSections) {
			sectionsToReturn.push(
				await populateRecursively(section, withProducts)
			);
		}

		return sectionsToReturn;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	// деструктуризация входных данных
	// для более удобного использования
	const { name, products } = changes;

	try {
		// проверка существования раздела
		// с входным id
		const sectionToUpdate = await Section.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!sectionToUpdate) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		// проверка существования раздела
		// с входным названием
		const sectionExists = await Section.exists({
			name,
			deletedAt: { $exists: false }
		});

		if (sectionExists) {
			throw {
				status: 409,
				message: `Section with name '${name}' already exists`
			};
		}

		// проверка существования
		// входных продуктов
		// если они есть в изменениях
		// обновление соответствующих продуктов
		if (products) {
			const notFoundIndex = (
				await Product.find({ _id: products })
			).findIndex(p => !p || p.deletedAt);
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

		await sectionToUpdate.updateOne(changes);

		return await Section.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		// проверка существования раздела
		// с входным id
		const sectionToDelete = await Section.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!sectionToDelete) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
		}

		// прерывание операции удаления
		// при наличии продуктов у раздела
		if (sectionToDelete.products.length) {
			throw {
				status: 400,
				message: "Can't delete a section with products in it"
			};
		}

		return sectionToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const populateNestedSections = async sections => {
	await Promise.all(
		sections.map(async s => {
			await s.populate('sections', 'sections');
			if (s.sections.length) {
				await populateNestedSections(s.sections);
			}
		})
	);
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

		const foundSection = await Section.findOne({
			...(isMongoId ? { _id: id } : { key: id }),
			deletedAt: { $exists: false }
		})
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

		await populateNestedSections(foundSection.sections);

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
