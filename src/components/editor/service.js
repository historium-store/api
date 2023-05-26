import Book from '../book/model.js';
import Editor from './model.js';

const createOne = async editorData => {
	let { fullName, books } = editorData;
	books = books ?? [];

	try {
		if (await Editor.exists({ fullName })) {
			throw {
				status: 409,
				message: `Editor with full name '${fullName}' already exists`
			};
		}

		const notFoundIndex = (await Book.find({ _id: books })).findIndex(
			b => !b
		);
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

		return await Editor.findById(newEditor.id).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'compilers',
				'editors',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		if (!(await Editor.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		return Editor.findById(id).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'compilers',
				'editors',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Editor.find().populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'compilers',
				'editors',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
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

		if (!editorToUpdate) {
			throw {
				status: 404,
				message: `Editor with id '${id}' not found`
			};
		}

		if (await Editor.exists({ fullName })) {
			throw {
				status: 409,
				message: `Editor with full name '${fullName}' already exists`
			};
		}

		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b);
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

		return await Editor.findByIdAndUpdate(id, changes, {
			new: true
		}).populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'compilers',
				'editors',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		});
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

export default { createOne, getOne, getAll, updateOne, deleteOne };
