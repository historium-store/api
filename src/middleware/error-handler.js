const errorHandler = (err, req, res, next) => {
	if (!err.status || err.status == 500) {
		console.log(err);
	}

	res.status(err?.status || 500).json({
		status: 'FAILED',
		data: { error: err?.message || err }
	});
};

export default errorHandler;
