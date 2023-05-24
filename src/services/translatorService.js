import { Book, Translator } from '../models/index.js';
import bookService from './bookService.js';

const createOne = async translatorData => {
	let { fullName, books } = translatorData;
	books = books ?? [];

	try {
		if (await Translator.exists({ fullName })) {
			throw {
				status: 409,
				message: `Translator with full name '${fullName}' already exists`
			};
		}

		for (let book of books) {
			await bookService.getOne(book);
		}

		const newTranslator = await Translator.create(translatorData);

		await Book.updateMany(
			{ _id: books },
			{ $push: { translators: newTranslator.id } }
		);

		return await Translator.findById(newTranslator.id) /* .populate({
			path: 'books',
			populate: [
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors',
				{
					path: 'product',
					populate: ['type', 'sections']
				}
			]
		}) */;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne };
