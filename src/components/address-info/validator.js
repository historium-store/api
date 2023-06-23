import { body } from 'express-validator';

const validateUpdate = [
	body('address')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Address address can't be empty"),
	body('street')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Address street can't be empty"),
	body('house')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Address house can't be empty"),
	body('apartment')
		.optional()
		.isInt()
		.withMessage("Address apartment can't be empty"),
	body('region')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Address region can't be empty"),
	body('postcode')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Address postcode can't be empty")
];

export default {
	validateUpdate
};
