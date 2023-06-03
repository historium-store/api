import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const getByIdFromToken = async (req, res, next) => {
	const { basket } = req.user;

	try {
		res.json(await service.getByIdFromToken(basket));
	} catch (err) {
		next(createError(err));
	}
};

const addItem = async (req, res, next) => {
	const { basket } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.addItem(basket, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const clearItems = async (req, res, next) => {
	const { basket } = req.user;

	try {
		await service.clearItems(basket);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default { getByIdFromToken, addItem, clearItems };
