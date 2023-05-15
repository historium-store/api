const errorHandler = (err, req, res, next) => {
	if (!err.status || err.status == 500) {
		console.log(err.message);
	}

	let error;
	try {
		error = JSON.parse(err.message ?? err);
	} catch {
		error = 'Internal server error';
	}

	res.status(err.status ?? 500).json({
		status: 'FAILED',
		data: {
			error
		}
	});
};

export default errorHandler;
