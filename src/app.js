import express from 'express';
import createHttpError from 'http-errors';
import logger from 'morgan';

const app = express();

app.use(logger('dev'));
app.use(express.json());

app.use((req, res, next) => next(createHttpError(404)));

app.use((err, req, res) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.sendStatus(err.status || 500);
});

export default app;
