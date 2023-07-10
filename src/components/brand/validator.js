import { body } from 'express-validator';

const validateCreate = [
	body('name').trim().notEmpty().withMessage('Brand name is required')
];

export default {
	validateCreate
};
