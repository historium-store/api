import { body, param } from 'express-validator';
import { isArrayOfIsbns, isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('product.name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required'),
	body('product.key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product key can't be empty"),
	body('product.type')
		.exists()
		.withMessage('Product type is required')
		.bail()
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
	body('product.price')
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('product.description')
		.trim()
		.notEmpty()
		.withMessage('Product description is required')
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('product.images')
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('product.quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('product.sections')
		.exists()
		.withMessage('Product must be in at least 1 section')
		.bail()
		.custom(isArrayOfMongoIds('Product', 'sections')),
	body('type').trim().notEmpty().withMessage('Book type is required'),
	body('languages')
		.isArray({ min: 1 })
		.withMessage('Book must have at least 1 language'),
	body('publisher')
		.exists()
		.withMessage('Book publisher is required')
		.bail()
		.isMongoId()
		.withMessage('Book publisher must be a valid mongo id'),
	body('publishedIn')
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year'),
	body('authors')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'authors')),
	body('compilers')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'compilers')),
	body('translators')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'translators')),
	body('illustrators')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'illustrators')),
	body('editors')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'editors')),
	body('series')
		.optional()
		.isMongoId()
		.withMessage('Book series must be a valid mongo id'),
	body('copies')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book copies must be a positive integer'),
	body('isbns').optional().custom(isArrayOfIsbns),
	body('firstPublishedIn')
		.optional()
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book first publication year'),
	body('originalName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book original name can't be empty"),
	body('font')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book font can't be empty"),
	body('format')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book format can't be empty"),
	body('pages')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book pages must be a positive integer'),
	body('weight')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book weight must be a positive integer'),
	body('paperType')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book paper type can't be empty"),
	body('bindingType')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book binding type can't be empty"),
	body('illustrationsType')
		.optional()
		.isArray()
		.withMessage("Book illustrations type can't be empty"),
	body('literaturePeriod')
		.optional()
		.isArray()
		.withMessage('Book literature period must be an array'),
	body('literatureCountry')
		.optional()
		.isArray()
		.withMessage("Book literature country can't be empty"),
	body('foreignLiterature')
		.optional()
		.isBoolean()
		.withMessage('Book foreign literature must be a boolean'),
	body('timePeriod')
		.optional()
		.isArray()
		.withMessage("Book time period can't be empty"),
	body('grade')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book grade can't be empty"),
	body('suitableAge')
		.optional()
		.isArray()
		.withMessage('Book suitable age must be an array'),
	body('packaging')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book packaging can't be empty"),
	body('occasion')
		.optional()
		.isArray()
		.withMessage('Book occasion must be an array'),
	body('style')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book style can't be empty"),
	body('suitableFor')
		.optional()
		.isArray()
		.withMessage('Book suitable for must be an array')
];

const validateUpdate = [
	body('product.name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product name can't be empty"),
	body('product.key')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product key can't be empty"),
	body('product.type')
		.optional()
		.isMongoId()
		.withMessage('Product type must be a valid mongo id'),
	body('product.price')
		.optional()
		.isCurrency({
			allow_negatives: false,
			digits_after_decimal: [1, 2]
		})
		.withMessage('Product price must be a valid currency value'),
	body('product.description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Product description can't be empty")
		.bail()
		.isLength({ min: 50, max: 10000 })
		.withMessage(
			'Product description must be between 50 and 10000 characters'
		),
	body('product.images')
		.optional()
		.isArray({ min: 1, max: 8 })
		.withMessage('Product must have between 1 and 8 images'),
	body('product.quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Product quantity must be a positive integer'),
	body('product.sections')
		.optional()
		.custom(isArrayOfMongoIds('Product', 'sections')),

	body('type')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book type can't be empty"),
	body('languages')
		.optional()
		.isArray({ min: 1 })
		.withMessage('Book must have at least 1 language'),
	body('publisher')
		.optional()
		.isMongoId()
		.withMessage('Book publisher must be a valid mongo id'),
	body('publishedIn')
		.optional()
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book publication year'),
	body('authors')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'authors')),
	body('compilers')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'compilers')),
	body('translators')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'translators')),
	body('illustrators')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'illustrators')),
	body('editors')
		.optional()
		.custom(isArrayOfMongoIds('Book', 'editors')),
	body('series')
		.optional()
		.isMongoId()
		.withMessage('Book series must be a valid mongo id'),
	body('copies')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book copies must be a positive integer'),
	body('isbns').optional().custom(isArrayOfIsbns),
	body('firstPublishedIn')
		.optional()
		.isInt({ allow_negatives: false, min: 1400 })
		.withMessage('Invalid book first publication year'),
	body('originalName')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book original name can't be empty"),
	body('font')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book font can't be empty"),
	body('format')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book format can't be empty"),
	body('format')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book pages must be a positive integer'),
	body('weight')
		.optional()
		.isInt({ allow_negatives: false })
		.withMessage('Book weight must be a positive integer'),
	body('paperType')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book paper type can't be empty"),
	body('bindingType')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book binding type can't be empty"),
	body('illustrationsType')
		.optional()
		.isArray()
		.withMessage('Book illustrations type must be an array'),
	body('literaturePeriod')
		.optional()
		.isArray()
		.withMessage('Book literature period must be an array'),
	body('literatureCountry')
		.optional()
		.isArray()
		.withMessage('Book literature country must be an array'),
	body('foreignLiterature')
		.optional()
		.isBoolean()
		.withMessage('Book foreign literature must be a boolean'),
	body('timePeriod')
		.optional()
		.isArray()
		.withMessage('Book time period must be an array'),
	body('grade')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book grade can't be empty"),
	body('suitableAge')
		.optional()
		.isArray()
		.withMessage('Book suitable age must be an array'),
	body('packaging')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book packaging can't be empty"),
	body('occasion')
		.optional()
		.isArray()
		.withMessage('Book occasion must be an array'),
	body('style')
		.optional()
		.trim()
		.notEmpty()
		.withMessage("Book style can't be empty"),
	body('suitableFor')
		.optional()
		.isArray()
		.withMessage('Book suitable for must be an array')
];

const validator = { validateCreate, validateUpdate };

export default validator;
