import { body } from 'express-validator';

const validateCreate = [
	body('leadsTo')
		.trim()
		.notEmpty()
		.withMessage("Banner property 'leadsTo' is required"),
	body('imageRect')
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageRect' is required"),
	body('imageSquare')
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageSquare' is required")
];

const validateUpdate = [
	body('leadsTo')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'leadsTo' can't be empty"),
	body('imageRect')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageRect' can't be empty"),
	body('imageSquare')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageSquare' can't be empty")
];

export default {
	validateCreate,
	validateUpdate
};
