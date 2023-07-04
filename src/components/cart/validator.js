import { body } from 'express-validator';

const validateMerge = [
	body('items').isArray().withMessage('Cart items must be an array')
];

export default {
	validateMerge
};
