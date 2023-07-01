import { body } from 'express-validator';
import { isArrayOfIsbns, isArrayOfMongoIds } from '../../utils.js';

const validateCreate = [
	body('product')
		.exists()
		.withMessage('Book product is required')
		.bail()
		.isMongoId()
		.withMessage('Book product must be a valid mongo id'),
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
		.withMessage('Book suitable for must be an array'),
	body('excerpts')
		.optional()
		.isArray({ max: 8 })
		.withMessage('Book can have up to 8 excerpts')
];

const validateUpdate = [
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
		.withMessage('Book suitable for must be an array'),
	body('excerpts')
		.optional()
		.isArray({ max: 8 })
		.withMessage('Book can have up to 8 excerpts')
];

export default {
	validateCreate,
	validateUpdate
};
