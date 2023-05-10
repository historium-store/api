import { body } from 'express-validator';
import validator from 'validator';

export const validateCreate = [
	body('fullName')
		.trim()
		.notEmpty()
		.withMessage('Author full name is required')
		.bail()
		.custom(value => {
			const valueCopy = value.slice().replace(' ', '');
			if (
				!validator.isAlpha(valueCopy, 'uk-UA') &&
				!validator.isAlpha(valueCopy, 'en-US')
			) {
				throw {
					message: 'Author full name can only contain letters'
				};
			}

			return true;
		})
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'Author full name must be between 2 and 50 characters'
		)
];
