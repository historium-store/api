import { createError } from '../../utils.js';
import service from './service.js';

const getAll = async (req, res, next) => {
	try {
		res.json(await service.getAll());
	} catch (err) {
		next(createError(err));
	}
};

const getOne = async (req, res, next) => {
	const { id } = req.params;

	try {
		res.json(await service.getOne(id));
	} catch (err) {
		next(createError(err));
	}
};

export default {
	getAll,
	getOne
};
