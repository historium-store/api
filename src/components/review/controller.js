import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const createOne = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const reviewData = matchedData(req);

		reviewData.user = user;

		res.status(201).json(await service.createOne(reviewData));
	} catch (err) {
		next(createError(err));
	}
};

const updateOne = async (req, res, next) => {
	try {
		const isAdmin = req.user.role === 'admin';
		const isSameUser = req.user.id === req.params.id;

		if (!isAdmin && !isSameUser) {
			throw {
				status: 403,
				message: 'Forbidden'
			};
		}

		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json(await service.updateOne(id, changes));
	} catch (err) {
		next(createError(err));
	}
};

const deleteOne = async (req, res, next) => {
	try {
		const isAdmin = req.user.role === 'admin';
		const isSameUser = req.user.id === req.params.id;

		if (!isAdmin && !isSameUser) {
			throw {
				status: 403,
				message: 'Forbidden'
			};
		}

		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		await service.deleteOne(id);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default {
	createOne,
	updateOne,
	deleteOne
};
