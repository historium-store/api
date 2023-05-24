import { matchedData, validationResult } from 'express-validator';
import translatorService from '../services/translatorService.js';
import { createError } from '../utils.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res.status(201).json(await translatorService.createOne(data));
	} catch (err) {
		next(createError(err));
	}
};

export default { createOne };
