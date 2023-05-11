const errorHandler = (err, req, res, next) => {
	let error = 'Internal server error';

	if (err.status == 500) {
		console.log(err.message);
	} else {
		error = JSON.parse(err.message);
	}

	res.status(err.status).json({
		status: 'FAILED',
		data: {
			error
		}
	});
};

export default errorHandler;
