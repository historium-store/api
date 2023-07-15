import { body, oneOf } from 'express-validator';
import { normalizePhoneNumber } from '../../utils.js';

const validateCreate = [
	body('contactInfo')
		.exists()
		.withMessage('Contact info is required')
		.bail()
		.isObject()
		.withMessage('Contact info must be an object'),
	body('contactInfo.firstName')
		.if(body('contactInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Contact first name is required'),
	body('contactInfo.lastName')
		.if(body('contactInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Contact last name is required'),
	body('contactInfo.phoneNumber')
		.if(body('contactInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Contact phone number is required')
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid contact phone number')
		.customSanitizer(normalizePhoneNumber),
	body('contactInfo.email')
		.if(body('contactInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Contact email is required')
		.bail()
		.isEmail()
		.withMessage('Invalid contact email')
		.normalizeEmail({ gmail_remove_dots: false }),

	body('receiverInfo')
		.optional()
		.isObject()
		.withMessage('Receiver info must be an object'),
	body('receiverInfo.firstName')
		.if(body('receiverInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Receiver first name is required'),
	body('receiverInfo.lastName')
		.if(body('receiverInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Receiver last name is required'),
	body('receiverInfo.phoneNumber')
		.if(body('receiverInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Receiver phone number is required')
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid receiver phone number')
		.customSanitizer(normalizePhoneNumber),

	body('companyInfo')
		.optional()
		.isObject()
		.withMessage('Company info must be an object'),
	body('companyInfo.name')
		.if(body('companyInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Company name is required'),
	body('companyInfo.identificationNumber')
		.if(body('companyInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Company identification number is required')
		.bail()
		.isNumeric({ no_symbols: true })
		.withMessage(
			'Company identification number can only contain digits'
		)
		.bail()
		.isLength({ min: 8, max: 12 })
		.withMessage(
			'Company identification number must be between 8 and 12 digits'
		),
	body('companyInfo.address')
		.if(body('companyInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Company address is required'),

	body('deliveryInfo')
		.optional()
		.isObject()
		.withMessage('Delivery info must be an object'),
	body('deliveryInfo.country')
		.if(body('deliveryInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Delivery country is required'),
	body('deliveryInfo.city')
		.if(body('deliveryInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Delivery city is required'),
	body('deliveryInfo.type')
		.if(body('deliveryInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Delivery type is required'),
	// oneOf(
	// 	[
	// 		body('deliveryInfo.address')
	// 			.trim()
	// 			.notEmpty()
	// 			.withMessage('Delivery address is required'),
	// 		[
	// 			body('deliveryInfo.street')
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage('Delivery street is required'),
	// 			body('deliveryInfo.house')
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage('Delivery house number is required'),
	// 			body('deliveryInfo.apartment')
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage('Delivery apartment number is required')
	// 		]
	// 	],
	// 	{ message: 'Invalid delivery address' }
	// ),

	body('gift').customSanitizer(value => Boolean(value)),
	body('callback').customSanitizer(value => Boolean(value)),
	body('paymentType')
		.trim()
		.notEmpty()
		.withMessage('Order payment type is required'),
	body('comment')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Comment length can be up to 500 characters'),
	body('items')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Order must have at least 1 item')
];

const validateUpdateStatus = [
	body('status')
		.isMongoId()
		.withMessage('Order status must be a valid mongo id')
];

const validateUpdate = [
	body('contactInfo')
		.optional()
		.isObject()
		.withMessage('Contact info must be an object'),
	body('contactInfo.firstName')
		.if(body('contactInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact first name can't be empty"),
	body('contactInfo.lastName')
		.if(body('contactInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact last name can't be empty"),
	body('contactInfo.phoneNumber')
		.if(body('contactInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact phone number can't be empty")
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid contact phone number')
		.customSanitizer(normalizePhoneNumber),
	body('contactInfo.email')
		.if(body('contactInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Contact email can't be empty")
		.bail()
		.isEmail()
		.withMessage('Invalid contact email')
		.normalizeEmail({ gmail_remove_dots: false }),

	body('receiverInfo')
		.optional()
		.isObject()
		.withMessage('Receiver info must be an object'),
	body('receiverInfo.firstName')
		.if(body('receiverInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Receiver first name can't be empty"),
	body('receiverInfo.lastName')
		.if(body('receiverInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Receiver last name can't be empty"),
	body('receiverInfo.phoneNumber')
		.if(body('receiverInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Receiver phone number can't be empty")
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid receiver phone number')
		.customSanitizer(normalizePhoneNumber),

	body('companyInfo')
		.optional()
		.isObject()
		.withMessage('Company info must be an object'),
	body('companyInfo.name')
		.if(body('companyInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Company name can't be empty"),
	body('companyInfo.identificationNumber')
		.if(body('companyInfo').exists())
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
		),
	body('companyInfo.address')
		.if(body('companyInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Company address can't be empty"),

	body('deliveryInfo')
		.optional()
		.isObject()
		.withMessage('Delivery info must be an object'),
	body('deliveryInfo.country')
		.if(body('deliveryInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Delivery country can't be empty"),
	body('deliveryInfo.city')
		.if(body('deliveryInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Delivery city can't be empty"),
	body('deliveryInfo.type')
		.if(body('deliveryInfo').exists())
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Delivery type can't be empty"),
	// oneOf(
	// 	[
	// 		body('deliveryInfo.address')
	// 			.optional()
	// 			.trim()
	// 			.notEmpty()
	// 			.withMessage("Delivery address can't be empty"),
	// 		[
	// 			body('deliveryInfo.street')
	// 				.optional()
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage("Delivery street can't be empty"),
	// 			body('deliveryInfo.house')
	// 				.optional()
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage("Delivery house number can't be empty"),
	// 			body('deliveryInfo.apartment')
	// 				.optional()
	// 				.trim()
	// 				.notEmpty()
	// 				.withMessage("Delivery apartment number can't be empty")
	// 		]
	// 	],
	// 	{ message: 'Invalid delivery address' }
	// ),

	body('gift')
		.optional()
		.customSanitizer(value => Boolean(value)),
	body('callback')
		.optional()
		.customSanitizer(value => Boolean(value)),
	body('paymentType')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Order payment type can't be empty"),
	body('comment')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Comment length can be up to 500 characters'),
	body('items')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Order must have at least 1 item'),
	body('status')
		.isMongoId()
		.withMessage('Order status must be a valid mongo id')
];

export default {
	validateCreate,
	validateUpdateStatus,
	validateUpdate
};
