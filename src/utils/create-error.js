import createHttpError from 'http-errors';

const createError = err => {
	return createHttpError(
		err.array ? 400 : err.status ?? 500,
		err.array ? JSON.stringify(err.array()) : err.message ?? err
	);
};

export default createError;
