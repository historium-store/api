import { createError } from '../../utils.js';
import service from './service.js';

const findProducts = async (req, res, next) => {
	const { q: valueToFind } = req.query;

	try {
		res.json(
			valueToFind ? await service.findProducts(valueToFind) : []
		);
	} catch (err) {
		next(createError(err));
	}
};

export default { findProducts };
