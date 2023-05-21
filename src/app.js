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
import productTypeRoutes from './routes/productTypeRoutes.js';
import publisherRoutes from './routes/publisherRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(authRoutes);
app.use('/user', userRoutes);
app.use('/section', sectionRoutes);
app.use('/product-type', productTypeRoutes);
app.use('/product', productRoutes);
app.use('/publisher', publisherRoutes);
app.use('/book', bookRoutes);
app.use('/book-series', bookSeriesRoutes);
app.use('/author', authorRoutes);
app.use('/file', fileRoutes);

app.use((req, res, next) =>
	next(createHttpError(404, 'Endpoint not found'))
);

app.use(errorHandler);

export default app;
