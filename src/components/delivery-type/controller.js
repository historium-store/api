import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const getAll = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const queryParams = matchedData(req);

		res.json(await service.getAll(queryParams));
	} catch (err) {
		next(createError(err));
	}
};

export default { getAll };
