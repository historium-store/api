import Product from '../product/model.js';
import Section from './model.js';

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

const getOne = async id => {
	try {
		// проверка существования раздела
		// с входным id
		const foundSection = await Section.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!foundSection) {
			throw {
				status: 404,
				message: `Section with id '${id}' not found`
			};
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
	// деструктуризация входных данных
	// для более удобного использования
	const { limit, offset: skip } = queryParams;

	try {
		return await Section.find({
			deletedAt: { $exists: false }
		})
			.limit(limit)
			.skip(skip);
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
