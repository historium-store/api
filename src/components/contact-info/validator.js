import { body, param } from 'express-validator';

const validateUpdate = [
	param('id')
		.isMongoId()
		.withMessage('Contact id must be a valid mongo id'),
	body('firstName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact first name can't be empty"),
	body('lastName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact last name can't be empty"),
	body('middleName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact middle name can't be empty"),
	body('phoneNumber')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact phone number can't be empty")
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid contact phone number'),
	body('email')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact email can't be empty")
		.bail()
		.isEmail()
		.withMessage('Invalid contact email')
		.normalizeEmail({
			gmail_remove_dots: false
		})
];

export default {
	validateUpdate
};
