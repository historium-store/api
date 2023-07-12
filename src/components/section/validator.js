import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Section name is required'),
	body('key')
		.trim()
		.notEmpty()
		.withMessage('Section key is required'),
	body('sections')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'sections')),
	body('root').customSanitizer(value => Boolean(value))
];

const validateUpdate = [
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section name can't be empty"),
	body('key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Section key can't be empty"),
	body('sections')
		.optional()
		.custom(isArrayOfMongoIds('Section', 'sections')),
	body('root')
		.optional()
		.customSanitizer(value => Boolean(value))
];

export default {
	validateCreate,
	validateUpdate
};
