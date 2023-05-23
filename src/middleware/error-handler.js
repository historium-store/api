const errorHandler = (err, req, res, next) => {
	let error;

	try {
		error = JSON.parse(err.message);
	} catch {
		if (!err.status || err.status == 500) {
			console.log(err.message);
			error = 'Internal server error';
		} else {
			error = err.message ?? err;
		}
	}

	res.status(err.status ?? 500).json({
		error
	});
};

export default errorHandler;
