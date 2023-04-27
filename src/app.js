import express from 'express';
import logger from 'morgan';
import passport from 'passport';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(authRouter);

app.use(errorHandler);

export default app;
