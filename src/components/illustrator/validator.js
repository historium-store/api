import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Illustrator full name is required'),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Illustrator', 'books'))
];

const validateUpdate = [
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Illustrator full name can't be empty"),
	body('books')
		.optional()
		.custom(isArrayOfMongoIds('Illustrator', 'books'))
];

export default {
	validateCreate,
	validateUpdate
};
