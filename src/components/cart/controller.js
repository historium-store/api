import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const getByIdFromToken = async (req, res, next) => {
	const { cart } = req.user;
	try {
		res.json(await service.getByIdFromToken(cart));
	} catch (err) {
		next(createError(err));
	}
};

const addItem = async (req, res, next) => {
	const { cart } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.addItem(cart, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const clearItems = async (req, res, next) => {
	const { cart } = req.user;

	try {
		await service.clearItems(cart);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default { getByIdFromToken, addItem, clearItems };
