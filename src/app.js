import express from 'express';
import logger from 'morgan';
import passport from 'passport';
import authRouter from './routes/auth.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(authRouter);

app.use((req, res, next) => {
	res.status(404).json({ message: 'Not found' });
});

export default app;
