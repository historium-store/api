import express from 'express';
import logger from 'morgan';
import errorHandler from './middleware/error-handler.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authRouter);

app.use(errorHandler);

export default app;
