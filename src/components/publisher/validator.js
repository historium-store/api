import { body } from 'express-validator';

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Publisher name is required')
		.bail()
		.isLength({ min: 1, max: 100 })
		.withMessage(
			'Publisher name must be between 1 and 100 characters'
		),
	body('description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Publisher description can't be empty")
		.bail()
		.isLength({ min: 40, max: 1000 })
		.withMessage(
			'Publisher description must be between 40 and 1000 characters'
		),
	body('logo')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Publisher logo must be a valid url')
];

const validateUpdate = [
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Publisher name can't be empty")
		.bail()
		.isLength({ min: 1, max: 100 })
		.withMessage(
			'Publisher name must be between 1 and 100 characters'
		),
	body('description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Publisher description can't be empty")
		.bail()
		.isLength({ min: 40, max: 1000 })
		.withMessage(
			'Publisher description must be between 40 and 1000 characters'
		),
	body('logo')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Publisher logo must be a valid url')
];

export default {
	validateCreate,
	validateUpdate
};
