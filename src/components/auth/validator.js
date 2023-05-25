import { body } from 'express-validator';
import { isEmailOrPhoneNumber } from '../../utils.js';

const validateSignup = [
	body('firstName')
		.trim()
		.notEmpty()
		.withMessage('User first name is required')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User first name must be between 2 and 50 characters'
		),
	body('lastName')
		.trim()
		.notEmpty()
		.withMessage('User last name is required')
		.bail()
		.isLength({ min: 2, max: 50 })
		.withMessage(
			'User last name must be between 2 and 50 characters'
		),
	body('phoneNumber')
		.trim()
		.notEmpty()
		.withMessage('User phone number is required')
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid user phone number format'),
	body('email')
		.trim()
		.notEmpty()
		.withMessage('User email is required')
		.bail()
		.isEmail()
		.withMessage('Invalid user email format')
		.normalizeEmail({
			gmail_remove_dots: false
		}),
	body('password')
		.trim()
		.notEmpty()
		.withMessage('User password is required')
		.bail()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters'),
	body('role')
		.default('user')
		.isIn(['user', 'seller', 'admin'])
		.withMessage('Invalid user role')
];

const validateLogin = [
	body('login')
		.trim()
		.notEmpty()
		.withMessage('User phone number or email is required')
		.bail()
		.custom(isEmailOrPhoneNumber)
		.if(body('login').isEmail())
		.normalizeEmail({
			gmail_remove_dots: false
		}),
	body('password')
		.trim()
		.isLength({ min: 8, max: 50 })
		.withMessage('User password must be between 8 and 50 characters')
];

const validatePasswordRestore = [
	body('login')
		.trim()
		.notEmpty()
		.withMessage('User phone number or email is required')
		.bail()
		.custom(isEmailOrPhoneNumber)
		.if(body('login').isEmail())
		.normalizeEmail({
			gmail_remove_dots: false
		})
];

const validateVerifyRestorationToken = [
	body('login')
		.trim()
		.notEmpty()
		.withMessage('User phone number or email is required')
		.bail()
		.custom(isEmailOrPhoneNumber)
		.if(body('login').isEmail())
		.normalizeEmail({
			gmail_remove_dots: false
		}),
	body('restorationToken')
		.trim()
		.notEmpty()
		.withMessage('Password restoration token is required')
];

const validator = {
	validateSignup,
	validateLogin,
	validatePasswordRestore,
	validateVerifyRestorationToken
};

export default validator;
