import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';
import passport from 'passport';

import authRouter from './routes/auth.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(authRouter);

app.use((req, res, next) => next(createHttpError(404)));

app.use(errorHandler);

function errorHandler(err, req, res) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.sendStatus(err.status || 500);
}

export default app;
