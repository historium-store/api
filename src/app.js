import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';
import { errorHandler } from './middleware.js';

import authRouter from './components/auth/router.js';
import authorRouter from './components/author/router.js';
import fileRouter from './components/file/router.js';
import sectionRouter from './components/section/router.js';
import translatorRouter from './components/translator/router.js';
import userRouter from './components/user/router.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use(authRouter);
app.use('/user', userRouter);
app.use('/section', sectionRouter);
app.use('/author', authorRouter);
app.use('/translator', translatorRouter);
app.use('/file', fileRouter);

app.use((req, res, next) =>
	next(createHttpError(404, 'Endpoint not found'))
);

app.use(errorHandler);

export default app;
