const upload = (req, res) => {
	res.json(req.files.map(f => f.location));
};

export default { upload };
