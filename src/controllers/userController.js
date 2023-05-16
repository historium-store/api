import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import userService from '../services/userService.js';

const createOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const data = matchedData(req);

		res.status(201).json({
			status: 'OK',
			data: await userService.createOne(data)
		});
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const getOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id } = matchedData(req);

		res.json({ status: 'OK', data: await userService.getOne(id) });
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const getAll = async (req, res, next) => {
	try {
		res.json({ status: 'OK', data: await userService.getAll() });
	} catch (err) {
		next(createHttpError(err.status, JSON.stringify(err.message)));
	}
};

const updateOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const { id, ...changes } = matchedData(req);

		res.json({
			status: 'OK',
			data: await userService.updateOne(id, changes)
		});
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

const deleteOne = async (req, res, next) => {
	try {
		validationResult(req)
			.formatWith(e => e.msg)
			.throw();

		const id = matchedData(req).id;

		res.json({
			status: 'OK',
			data: await userService.deleteOne(id)
		});
	} catch (err) {
		next(
			createHttpError(
				err.array ? 400 : err.status,
				JSON.stringify(err.array ? err.array() : err.message)
			)
		);
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
