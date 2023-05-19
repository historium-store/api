import { Author } from '../models/index.js';

const createOne = async authorData => {
	const exists =
		(await Author.findOne({ fullName: authorData.fullName })) !==
		null;

	if (exists) {
		throw {
			status: 409,
			message: `Author with full name '${authorData.fullName}' already exists`
		};
	}

	authorData.books = [];

	try {
		return await Author.create(authorData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const author = await Author.findById(id);

		if (!author) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Author.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const exists =
		(await Author.findOne({ fullName: changes.fullName })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Author with full name '${changes.fullName}' already exists`
		};
	}

	try {
		const author = await Author.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!author) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const author = await Author.findByIdAndDelete(id);

		if (!author) {
			throw {
				status: 404,
				message: `Author with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
