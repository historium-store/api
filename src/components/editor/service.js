import Book from '../book/model.js';
import Editor from './model.js';

const createOne = async editorData => {
	let { fullName, books } = editorData;
	books = books ?? [];

	try {
		const existingEditor = await Editor.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingEditor) {
			throw {
				status: 409,
				message: `Editor with full name '${fullName}' already exists`
			};
		}

		const notFoundIndex = (
			await Book.find({
				_id: books
			})
		).findIndex(b => !b || b.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Book with id '${books[notFoundIndex]}' not found`
			};
		}

		const newEditor = await Editor.create(editorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { editors: newEditor.id } }
		);

		return newEditor;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundEditor = await Editor.findById(id);

		if (!foundEditor || foundEditor.deletedAt) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		return foundEditor;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		const filter = {
			deletedAt: { $exists: false }
		};

		return await Editor.find(filter)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { fullName, books } = changes;

	try {
		const editorToUpdate = await Editor.findById(id);

		if (!editorToUpdate || editorToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		const existingEditor = await Editor.exists({
			fullName,
			deletedAt: { $exists: false }
		});

		if (existingEditor && existingEdito._id.toHexString() !== id) {
			throw {
				status: 409,
				message: `Editor with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b || b.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Book with id '${books[notFoundIndex]}' not found`
				};
			}

			const oldBookIds = editorToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { editors: editorToUpdate.id } }
			);

			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { editors: editorToUpdate.id } }
			);
		}

		await editorToUpdate.updateOne(changes);

		return await Editor.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const editorToDelete = await Editor.findById(id);

		if (!editorToDelete || editorToDelete.deletedAt) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: editorToDelete.books },
			{ $pull: { editors: editorToDelete.id } }
		);

		await editorToDelete.deleteOne();

		return editorToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};
