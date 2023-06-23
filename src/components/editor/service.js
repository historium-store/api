import Book from '../book/model.js';
import Editor from './model.js';

const checkEditorExistense = async fullName => {
	const existingEditor = await Editor.where('fullName')
		.equals(fullName)
		.where('deletedAt')
		.exists(false)
		.findOne();

	if (existingEditor) {
		throw {
			status: 409,
			message: `Editor with full name '${fullName}' already exists`
		};
	}
};

const createOne = async editorData => {
	let { fullName, books } = editorData;
	books = books ?? [];

	try {
		await checkEditorExistense(fullName);

		await Promise.all(
			books.map(async id => {
				const existingBook = await Book.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingBook) {
					throw {
						status: 404,
						message: `Book with id '${id}' not found`
					};
				}
			})
		);

		const newEditor = await Editor.create(editorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { editors: newEditor } }
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
		const foundEditor = await Editor.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundEditor) {
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
		return await Editor.where('deletedAt')
			.exists(false)
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
		const editorToUpdate = await Editor.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!editorToUpdate) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		await checkEditorExistense(fullName);

		if (books) {
			await Promise.all(
				books.map(async id => {
					const existingBook = await Book.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.findOne();

					if (!existingBook) {
						throw {
							status: 404,
							message: `Book with id '${id}' not found`
						};
					}
				})
			);

			const oldBookIds = editorToUpdate.books.map(b =>
				b.toHexString()
			);
			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);

			await Book.updateMany(
				{ _id: addedBookIds },
				{ $push: { editors: editorToUpdate.id } }
			);

			await Book.updateMany(
				{ _id: removedBookIds },
				{ $pull: { editors: editorToUpdate.id } }
			);
		}

		Object.keys(changes).forEach(
			key => (editorToUpdate[key] = changes[key])
		);

		return await editorToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const editorToDelete = await Editor.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!editorToDelete) {
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
