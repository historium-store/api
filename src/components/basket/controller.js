import { createError } from '../../utils.js';
import service from './service.js';

const getByUserId = async (req, res, next) => {
	const { id } = req.user;

	try {
		res.json(await service.getByUserId(id));
	} catch (err) {
		next(createError(err));
	}
};

export default { getByUserId };
