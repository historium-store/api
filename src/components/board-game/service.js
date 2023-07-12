import validator from 'validator';
import Brand from '../brand/model.js';
import Product from '../product/model.js';
import BoardGame from './model.js';

const createOne = async boardGameData => {
	const { product, brand } = boardGameData;

	try {
		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const brandToUpdate = await Brand.where('_id')
			.equals(brand)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne();

		if (!brandToUpdate) {
			throw {
				status: 404,
				message: `Brand with id '${brand}' not found`
			};
		}

		const newBoardGame = await BoardGame.create(boardGameData);

		await brandToUpdate.updateOne({
			$push: { products: newBoardGame.id }
		});

		return newBoardGame;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const query = BoardGame.where('deletedAt').exists(false);

		const isMongoId = validator.isMongoId(id);

		if (isMongoId) {
			query.where('_id').equals(id);
		} else {
			const product = await Product.where('key')
				.equals(id)
				.where('deletedAt')
				.exists(false)
				.select('_id')
				.transform(product => ({ ...product, id: product._id }))
				.findOne()
				.lean();

			query.where('product').equals(product?.id);
		}

		return await query
			.populate([
				{
					path: 'product',
					populate: { path: 'type', select: '-_id name key' }
				},
				{ path: 'brand', select: 'name' }
			])
			.findOne()
			.lean();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		const query = BoardGame.where('deletedAt').exists(false);

		const foundBoardGames = await query
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy ?? 'createdAt']: order ?? 'asc' })
			.populate([
				{
					path: 'product',
					populate: { path: 'type', select: '-_id name key' },
					select:
						'name creators key price quantity createdAt code images requiresDelivery',
					transform: product => ({
						...product,
						image: product.image ?? product.images[0],
						images: undefined
					})
				}
			])
			.select('-_id product')
			.lean();

		return {
			result: foundBoardGames.map(b => b.product),
			total: await BoardGame.where('deletedAt')
				.exists(false)
				.countDocuments(),
			totalFound: foundBoardGames.length
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
	getAll
};
