import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import authService from '../auth/service.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const orderData = matchedData(req);

		const authHeader = req.get('Authorization');

		if (authHeader) {
			orderData.user = (
				await authService.authenticate(authHeader)
			).id;
		}

		res.status(201).json(await service.createOne(orderData));
	} catch (err) {
		next(createError(err));
	}
};

export default { createOne };
