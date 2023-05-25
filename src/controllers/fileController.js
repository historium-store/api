const upload = (req, res) => {
	res.json(req.files.map(f => f.filename));
};

const send = (req, res) => {
	const { fileName } = req.params;

	res.sendFile(fileName, { root: 'uploads' });
};

export default { upload, send };
