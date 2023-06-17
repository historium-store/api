import { body, param } from 'express-validator';

const validateUpdate = [
	param('id')
		.isMongoId()
		.withMessage('Delivery info id must be a valid mongo id'),
	body('country')
		.optional()
		.isMongoId()
		.withMessage('Delivery country must be a valid mongo id'),
	body('city')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Delivery city can't be empty"),
	body('type')
		.optional()
		.isMongoId()
		.withMessage('Delivery type must be a valid mongo id'),
	body('contactInfo')
		.optional()
		.isMongoId()
		.withMessage('Delivery contact info must be a valid mongo id')
];

export default {
	validateUpdate
};
