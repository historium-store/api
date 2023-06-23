import { body } from 'express-validator';

const validateItem = [
	body('product')
		.exists()
		.withMessage('Product id is required')
		.bail()
		.isMongoId()
		.withMessage('Product id must be a valid mongo id'),
	body('quantity')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Product quantity must be an integer')
];

export default {
	validateItem
};
