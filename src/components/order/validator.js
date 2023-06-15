import { body, param } from 'express-validator';

const validateCreate = [
	body('contactInfo')
		.exists()
		.withMessage('Contact info is required')
		.bail()
		.isObject()
		.withMessage('Contact info must be an object'),
	body('contactInfo.firstName')
		.trim()
		.notEmpty()
		.withMessage('Contact first name is required'),
	body('contactInfo.lastName')
		.trim()
		.notEmpty()
		.withMessage('Contact last name is required'),
	body('contactInfo.phoneNumber')
		.trim()
		.notEmpty()
		.withMessage('Contact phone number is required')
		.bail()
		.isMobilePhone('uk-UA')
		.withMessage('Invalid contact phone number'),
	body('contactInfo.email')
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
		.withMessage('Invalid contact phone number'),

	body('gift').customSanitizer(value => Boolean(value)),

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
		.withMessage('Company identification number must be a number')
		.bail()
		.isLength({ min: 8, max: 12 })
		.withMessage(
			'Company identification number must be between 8 and 12 digits'
		),
	body('companyInfo.addressInfo.address')
		.if(body('companyInfo').exists())
		.trim()
		.notEmpty()
		.withMessage('Company address is required'),

	body('callback').customSanitizer(value => Boolean(value)),

	body('deliveryInfo')
		.exists()
		.withMessage('Delivery info is required')
		.bail()
		.isObject()
		.withMessage('Delivery info must be an object'),
	body('deliveryInfo.country')
		.trim()
		.notEmpty()
		.withMessage('Delivery country is required')
		.bail()
		.isMongoId()
		.withMessage('Delivery country must be a valid mongo id'),
	body('deliveryInfo.city')
		.trim()
		.notEmpty()
		.withMessage('Delivery city is required'),
	body('deliveryInfo.type')
		.trim()
		.notEmpty()
		.withMessage('Delivery type is required')
		.bail()
		.isMongoId()
		.withMessage('Delivery type must be a valid mongo id'),

	body('deliveryInfo.addressInfo')
		.exists()
		.withMessage('Delivery addressInfo is required')
		.bail()
		.isObject()
		.withMessage('Delivery address info must be an object'),
	body('deliveryInfo.addressInfo.address')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery address is required'),
	body('deliveryInfo.addressInfo.street')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery street is required'),
	body('deliveryInfo.addressInfo.house')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery house is required'),
	body('deliveryInfo.addressInfo.apartment')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery apartment is required'),
	body('deliveryInfo.addressInfo.region')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery region is required'),
	body('deliveryInfo.addressInfo.postcode')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery postcode is required'),

	body('deliveryInfo.contactInfo')
		.optional()
		.isObject()
		.withMessage('Delivery contact info must be an object'),
	body('deliveryInfo.contactInfo.firstName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery contact first name is required'),
	body('deliveryInfo.contactInfo.lastName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery contact last name is required'),
	body('deliveryInfo.contactInfo.middleName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Delivery contact middle name is required'),

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
		.isArray({ min: 1 })
		.withMessage('Order must have at least 1 item')
];

const validateId = [
	param('id')
		.isMongoId()
		.withMessage('Order id must be a valid mongo id')
];

const validateUpdateStatus = [
	...validateId,
	body('status')
		.isMongoId()
		.withMessage('Order status must be a valid mongo id')
];

export default {
	validateCreate,
	validateId,
	validateUpdateStatus
};
