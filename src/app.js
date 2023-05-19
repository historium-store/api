import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';
import { errorHandler } from './middleware/index.js';

import authRoutes from './routes/authRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import bookSeriesRoutes from './routes/bookSeriesRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import productRoutes from './routes/productRoutes.js';
import publisherRoutes from './routes/publisherRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(authRoutes);
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/publisher', publisherRoutes);
app.use('/book', bookRoutes);
app.use('/book-series', bookSeriesRoutes);
app.use('/author', authorRoutes);
app.use('/file', fileRoutes);

app.use((req, res, next) =>
	next(createHttpError(404, JSON.stringify('Endpoint not found')))
);

app.use(errorHandler);

export default app;
