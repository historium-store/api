import Book from '../book/model.js';
import Editor from './model.js';

const createOne = async editorData => {
	let { fullName } = editorData;

	try {
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

		return await Editor.create(editorData);
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
		const foundEditors = await Editor.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.lean();

		foundEditors.sort((a, b) =>
			a.fullName.localeCompare(b.fullName, 'uk')
		);

		return foundEditors;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { fullName } = changes;

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
