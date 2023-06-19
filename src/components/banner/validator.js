import { body, param } from 'express-validator';

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

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Banner id must be a valid mongo id')
];

const validateUpdate = [
	...validateId,
	body('leadsTo')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'leadsTo' is required"),
	body('imageRect')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageRect' is required"),
	body('imageSquare')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Banner property 'imageSquare' is required")
];

export default {
	validateCreate,
	validateId,
	validateUpdate
};
