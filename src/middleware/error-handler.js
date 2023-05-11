const errorHandler = (err, req, res, next) => {
	let message;
	if (err.status == 500) {
		console.log(err.message);
		message = 'Internal server error';
	} else {
		try {
			message = JSON.parse(err.message);
		} catch {
			message = err.message;
		}
	}

	res.status(err.status).json({
		status: 'FAILED',
		data: {
			error: message
		}
	});
};

export default errorHandler;
