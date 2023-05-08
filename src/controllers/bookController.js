import createHttpError from 'http-errors';
import bookService from '../services/bookService.js';

const createOne = (req, res, next) => {
	const {
		product,
		bookType,
		author,
		language,
		publisher,
		publicationYear,
		description
	} = req.body;

	try {
		const book = bookService.createOne({
			product,
			bookType,
			author,
			language,
			publisher,
			publicationYear,
			description
		});

		res.status(201).json({ status: 'OK', data: book });
	} catch (err) {
		next(createHttpError(err.status, err.message));
	}
};

export default { createOne };
