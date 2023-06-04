import Product from '../product/model.js';
import Section from './model.js';

import validator from 'validator';

const createOne = async sectionData => {
	// деструктуризация входных данных
	// для более удобного использования
	let { name, products } = sectionData;
	products = products ?? [];

	try {
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
		// входных продуктов раздела
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

		// добавление ссылки на новый раздел
		// соответствующим продуктам
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
		.populate('sections')
		.select(
			`-createdAt -updatedAt ${withProducts ? '' : '-products'}`
		);

	if (!section) {
		return null;
	}

	const populatedSubsections = await Promise.all(
		section.sections.map(async subsection => {
			return await populateRecursively(subsection._id, withProducts);
		})
	);

	section.sections = populatedSubsections;

	return section;
};

const getOne = async (id, withProducts) => {
	try {
		const isMongoId = validator.isMongoId(id);

		// проверка существования раздела
		// с входным id
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
	// деструктуризация входных данных
	// для более удобного использования
	const { limit, offset: skip, withProducts } = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		const foundSections = await Section.find(filter)
			.limit(limit)
			.skip(skip);

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

export default { createOne, getOne, getAll, updateOne, deleteOne };
