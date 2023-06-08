import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const addItem = async (req, res, next) => {
	const { cart } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const itemData = matchedData(req);

		await service.addItem(cart, itemData);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const removeItem = async (req, res, next) => {
	const { cart } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const itemData = matchedData(req);

		await service.removeItem(cart, itemData);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default { addItem, removeItem };
