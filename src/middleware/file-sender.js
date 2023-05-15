const fileSender = (req, res) => {
	const { filename } = req.params;

	res.sendFile(filename, {
		root: 'uploads'
	});
};

export default fileSender;
