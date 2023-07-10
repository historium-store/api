import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const brandData = matchedData(req);

		res.status(201).json(await service.createOne(brandData));
	} catch (err) {
		next(createError(err));
	}
};

export default {
	createOne
};
