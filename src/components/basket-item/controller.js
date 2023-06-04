import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

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

const removeItem = async (req, res, next) => {
	const { basket } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.removeItem(basket, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default { addItem, removeItem };