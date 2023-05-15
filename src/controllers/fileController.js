const upload = (req, res, next) => {
	res.json({
		status: 'OK',
		data: { files: req.files.map(f => f.filename) }
	});
};

const send = (req, res, next) => {
	const { fileName } = req.params;

	res.sendFile(fileName, { root: 'uploads' });
};

export default { upload, send };
