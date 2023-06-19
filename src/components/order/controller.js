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

const getOne = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		const order = await service.getOne(id);

		const isPrivilegedUser = ['admin', 'seller'].includes(
			req.user.role
		);
		const isSameUser = order.user._id === user;

		if (!isPrivilegedUser || isSameUser) {
			throw {
				status: 403,
				message: 'Forbidden'
			};
		}

		res.json({ ...order });
	} catch (err) {
		next(createError(err));
	}
};

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

const getStatuses = async (req, res, next) => {
	try {
		res.json(await service.getStatuses());
	} catch (err) {
		next(createError(err));
	}
};

const updateStatus = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, status } = matchedData(req);

		res.json(await service.updateStatus(id, status));
	} catch (err) {
		next(createError(err));
	}
};

const updateOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json(await service.updateStatus(id, changes));
	} catch (err) {
		next(createError(err));
	}
};

export default {
	createOne,
	getOne,
	getAll,
	getStatuses,
	updateStatus,
	updateOne
};
