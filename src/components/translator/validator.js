import { body } from 'express-validator';

const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Translator full name is required')
];

const validateUpdate = [
	body('fullName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Translator full name can't be empty")
];

export default {
	validateCreate,
	validateUpdate
};
