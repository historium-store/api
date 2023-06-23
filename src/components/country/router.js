import { Router } from 'express';
import controller from './controller.js';

const countryRouter = Router();

countryRouter.get('/', controller.getAll);

countryRouter.get('/:id', controller.getOne);

export default countryRouter;
