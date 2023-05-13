import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';
import errorHandler from './middleware/error-handler.js';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(authRoutes);
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/book', bookRoutes);

app.use((req, res, next) =>
	next(createHttpError(404, JSON.stringify('Endpoint not found')))
);

app.use(errorHandler);

export default app;
