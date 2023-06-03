import { body } from 'express-validator';

const validateItem = [
	body('product')
		.exists()
		.withMessage('Product id is required')
		.bail()
		.isMongoId()
		.withMessage('Product id must be a valid mongo id')
];

const validator = { validateItem };

export default validator;
