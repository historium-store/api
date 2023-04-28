const errorHandler = (err, req, res, next) => {
	if (!err.status) {
		console.log(err);

		return res.sendStatus(500);
	}

	res.status(err.status).json({ message: err.message });
};

export default errorHandler;
