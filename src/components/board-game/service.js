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

export default {
	createOne
};
