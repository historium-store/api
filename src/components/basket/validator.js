import { body } from 'express-validator';

const validateAddItem = [
	body('product')
		.exists()
		.withMessage('Product id is required')
		.bail()
		.isMongoId()
		.withMessage('Product id must be a valid mongo id')
];

const validator = { validateAddItem };

export default validator;
