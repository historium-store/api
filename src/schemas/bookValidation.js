import { creationSchema as productCreationSchema } from '../schemas/productValidation.js';
import { creationSchema as authorCreationSchema } from './authorValidation.js';
import { creationSchema as publisherCreationSchema } from './publisherValidation.js';

const addPrefix = (obj, prefix) => {
	const result = { ...obj };

	Object.keys(result).forEach(k => {
		result[`${prefix}.${k}`] = result[k];
		delete result[k];
	});

	return result;
};

export const creationSchema = {
	...addPrefix(productCreationSchema, 'product'),
	bookType: {
		notEmpty: { errorMessage: 'Book type is required', bail: true },
		isIn: {
			options: ['Паперова', 'Електронна', 'Аудіо'],
			errorMessage: 'Invalid book type'
		}
	},
	...addPrefix(authorCreationSchema, 'author'),
	language: {
		notEmpty: {
			errorMessage: 'Book language is required',
			bail: true
		},
		isString: { errorMessage: 'Book language must be a string' }
	},
	...addPrefix(publisherCreationSchema, 'publisher'),
	publicationYear: {
		notEmpty: {
			errorMessage: 'Book publication year is required',
			bail: true
		},
		isDecimal: {
			errorMessage: 'Book publication year must be a number'
		}
	},
	description: {
		notEmpty: {
			errorMessage: 'Book description is required',
			bail: true
		},
		isString: { errorMessage: 'Book description must be a string' }
	}
};
