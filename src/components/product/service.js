import { getProductCode } from '../../triggers/product-code.js';
import { transliterateToKey } from '../../utils.js';
import Book from '../book/model.js';
import ProductType from '../product-type/model.js';
import Review from '../review/model.js';
import Section from '../section/model.js';
import Product from './model.js';

const createOne = async productData => {
	// деструктуризация входных данных
	// для более удобного использования
	let { name, key, type, sections } = productData;
	sections = sections ?? [];

	try {
		// проверка на существование
		// входного типа продукта
		const productTypeExists = await ProductType.exists({
			_id: type,
			deletedAt: { $exists: false }
		});

		if (!productTypeExists) {
			throw {
				status: 404,
				message: `Product type with id '${type}' not found`
			};
		}

		// проверка на существование
		// входных разделов продукта
		const notFoundIndex = (
			await Section.find({ _id: sections })
		).findIndex(s => !s || s.deletedAt);

		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Section with id '${sections[notFoundIndex]}' not found`
			};
		}

		// проверка на существование
		// входного ключа продукта
		// генерация при отсутствии
		if (!key) {
			productData.key = key = transliterateToKey(name);
		}

		// проверка на уникальность
		// входного ключа продукта
		// добавление кода продукта
		// в конец при неуникальности
		const productExists = await Product.exists({ key });

		if (productExists) {
			productData.key += `-${await getProductCode()}`;
		}

		const newProduct = await Product.create(productData);

		// добавление ссылки на новый продукт
		// в соответствущие разделы
		await Section.updateMany(
			{ _id: sections },
			{ $push: { products: newProduct.id } }
		);

		return newProduct;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		// проверка на существование
		// продукта с входным id
		const foundProduct = await Product.findOne({
			_id: id,
			deletedAt: { $exists: false }
		}).populate([
			{ path: 'type', select: 'name' },
			{ path: 'sections', select: 'name key' }
		]);

		if (!foundProduct) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		// настройка заполнения specificProduct
		// в зависимости от типа продукта
		const paths = [
			{ path: 'type', select: 'name key' },
			{ path: 'sections', select: 'name key' }
		];

		switch (foundProduct.type.name) {
			case 'Книга':
			case 'Електронна книга':
			case 'Аудіокнига':
				paths.push({
					path: 'specificProduct',
					model: 'Book',
					populate: [
						{ path: 'publisher', select: 'name' },
						{
							path: 'authors',
							select: 'fullName pictures biography'
						},
						{ path: 'compilers', select: 'fullName' },
						{ path: 'translators', select: 'fullName' },
						{ path: 'illustrators', select: 'fullName' },
						{ path: 'editors', select: 'fullName' },
						{ path: 'series', select: 'name' }
					],
					select: '-product'
				});
				break;
		}

		return await Product.findById(id).populate(paths);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip } = queryParams;
	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		// поиск продуктов, ограничение, смещение,
		// заполнение и выбор нужных полей
		const foundProducts = await Product.find(filter)
			.limit(limit)
			.skip(skip)
			.populate([{ path: 'type', select: '-_id name key' }])
			.select('type');

		const productsToReturn = [];

		for (let product of foundProducts) {
			switch (product.type.name) {
				case 'Книга':
				case 'Електронна книга':
				case 'Аудіокнига':
					const foundProduct = (
						await Product.findById(product.id)
							.populate([
								{ path: 'type', select: '-_id name key' },
								{
									path: 'specificProduct',
									model: 'Book',
									populate: [
										{ path: 'authors', select: '-_id fullName' }
									],
									select: '-_id authors'
								}
							])
							.select('name key price quantity code images')
					).toObject();

					foundProduct.image = foundProduct.images[0];

					delete foundProduct.images;

					foundProduct.authors =
						foundProduct.specificProduct?.authors.map(
							a => a.fullName
						);

					delete foundProduct.specificProduct;

					productsToReturn.push(foundProduct);
					break;
			}
		}

		return productsToReturn;
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
	const { key, type, sections } = changes;

	try {
		// проверка на существование
		// продукта с входным id
		const productToUpdate = await Product.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!productToUpdate) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		// проверка на уникальность
		// входного ключа продукта
		// если он был изменён,
		// добавление кода продукта
		// в конец при неуникальности
		if (key && productToUpdate.key !== key) {
			const productExists = await Product.exists({ key });

			if (productExists) {
				changes.key = `${key}-${productToUpdate.code}`;
			}
		}

		// проверка на существование
		// входного типа продукта
		// если он был изменён
		if (type && type !== productToUpdate.type.toHexString()) {
			const productTypeExists = await ProductType.exists({
				_id: type,
				deletedAt: { $exists: false }
			});

			if (!productTypeExists) {
				throw {
					status: 404,
					message: `Product type with id '${type}' not found`
				};
			}
		}

		// проверка на существование
		// входных разделов продукта
		let addedSectionIds = [];
		let removedSectionIds = [];
		if (sections) {
			const notFoundIndex = (
				await Section.find({ _id: sections })
			).findIndex(s => !s || s.deletedAt);

			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Section with id '${sections[notFoundIndex]}' not found`
				};
			}

			const oldSectionIds = productToUpdate.sections.map(s =>
				s.id.toHexString()
			);

			addedSectionIds = sections.filter(
				s => !oldSectionIds.includes(s)
			);
			removedSectionIds = oldSectionIds.filter(
				s => !sections.includes(s)
			);
		}

		// обновление соответствующих
		// разделов продукта
		await Section.updateMany(
			{ _id: addedSectionIds },
			{ $addToSet: { products: productToUpdate.id } }
		);
		await Section.updateMany(
			{ _id: removedSectionIds },
			{ $pull: { products: productToUpdate.id } }
		);

		await productToUpdate.updateOne(changes);

		return await Product.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const productToDelete = await Product.findOne({
			_id: id,
			deletedAt: { $exists: false }
		}).populate([{ path: 'type', select: 'name' }]);

		if (!productToDelete) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		await Section.updateMany(
			{ _id: productToDelete.sections },
			{ $pull: { products: productToDelete.id } }
		);

		switch (productToDelete.type.name) {
			case 'Книга':
			case 'Електронна книга':
			case 'Аудіокнига':
				await Book.deleteOne({
					product: productToDelete.id
				});
				break;
		}

		await productToDelete.deleteOne();

		return productToDelete;
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
	deleteOne
};
