import { matchedData, validationResult } from 'express-validator';
import { createError } from '../../utils.js';
import service from './service.js';

const getOne = async (req, res, next) => {
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

		res.json(await service.getOne(id));
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

const updateOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		const isAdmin = req.user.role === 'admin';
		const isSameUser = req.user.id === req.params.id;

		if ((!isAdmin && !isSameUser) || (changes.role && !isAdmin)) {
			throw {
				status: 403,
				message: 'Forbidden'
			};
		}

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

const getAccount = async (req, res) => {
	res.json(req.user);
};

const addToWishlist = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.addToWishlist(user, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const removeFromWishlist = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.removeFromWishlist(user, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const getOrders = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const queryParams = matchedData(req);

		res.json(await service.getOrders(queryParams, user));
	} catch (err) {
		next(createError(err));
	}
};

const addToHistory = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.addToHistory(user, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const getHistory = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		res.json(await service.getHistory(user));
	} catch (err) {
		next(createError(err));
	}
};

const mergeHistory = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { history } = matchedData(req);

		res.json(await service.mergeHistory(user, history));
	} catch (err) {
		next(createError(err));
	}
};

const addToWaitlist = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.addToWaitlist(user, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

const removeFromWaitlist = async (req, res, next) => {
	const { id: user } = req.user;

	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { product } = matchedData(req);

		await service.removeFromWaitlist(user, product);

		res.sendStatus(204);
	} catch (err) {
		next(createError(err));
	}
};

export default {
	getOne,
	getAll,
	updateOne,
	deleteOne,
	getAccount,
	addToWishlist,
	removeFromWishlist,
	getOrders,
	addToHistory,
	getHistory,
	mergeHistory,
	addToWaitlist,
	removeFromWaitlist
};
