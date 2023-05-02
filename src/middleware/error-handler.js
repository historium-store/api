export const errorHandler = (err, req, res, next) => {
	res.status(err?.status || 500).json({
		status: 'FAILED',
		data: { error: err?.message || err }
	});
};
