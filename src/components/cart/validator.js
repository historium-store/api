import { body } from 'express-validator';
import { isArrayOfMongoIds } from '../../utils.js';

const validateMerge = [body('items').custom(isArrayOfMongoIds)];

export default { validateMerge };
