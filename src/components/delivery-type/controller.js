import { validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const getAll = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		res.json(await service.getAll());
	} catch (err) {
		next(createError(err));
	}
};

export default {
	getAll
};
