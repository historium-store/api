import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';
import { errorHandler } from './middleware.js';

import authRouter from './components/auth/router.js';
import authorRouter from './components/author/router.js';
import bookSeriesRouter from './components/book-series/router.js';
import bookRouter from './components/book/router.js';
import compilerRouter from './components/compiler/router.js';
import editorRouter from './components/editor/router.js';
import fileRouter from './components/file/router.js';
import illustratorRouter from './components/illustrator/router.js';
import productTypeRouter from './components/product-type/router.js';
import productRouter from './components/product/router.js';
import publisherRouter from './components/publisher/router.js';
import sectionRouter from './components/section/router.js';
import translatorRouter from './components/translator/router.js';
import userRouter from './components/user/router.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(authRouter);
app.use('/user', userRouter);
app.use('/section', sectionRouter);
app.use('/product-type', productTypeRouter);
app.use('/product', productRouter);
app.use('/publisher', publisherRouter);
app.use('/book', bookRouter);
app.use('/author', authorRouter);
app.use('/compiler', compilerRouter);
app.use('/translator', translatorRouter);
app.use('/illustrator', illustratorRouter);
app.use('/editor', editorRouter);
app.use('book-series', bookSeriesRouter);
app.use('/file', fileRouter);

app.use((req, res, next) =>
	next(createHttpError(404, 'Endpoint not found'))
);

app.use(errorHandler);

export default app;
