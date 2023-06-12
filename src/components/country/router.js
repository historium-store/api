import { Router } from 'express';
import controller from './controller.js';

const countryRouter = Router();

countryRouter.get('/', controller.getAll);

export default countryRouter;
