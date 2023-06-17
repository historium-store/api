import { body, param } from 'express-validator';

const validateUpdate = [
	param('id')
		.isMongoId()
		.withMessage('Company info id must be a valid mongo id'),
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Company name can't be empty"),
	body('identificationNumber')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Company identification number can't be empty")
		.bail()
		.isNumeric({ no_symbols: true })
		.withMessage(
			'Company identification number can only contain digits'
		)
		.bail()
		.isLength({ min: 8, max: 12 })
		.withMessage(
			'Company identification number must be between 8 and 12 digits'
		)
];

export default {
	validateUpdate
};
