import fs from 'fs';

const fileSender = (req, res) => {
	const { id } = req.params;

	const file = fs.readdirSync('uploads').find(f => f.includes(id));

	res.sendFile(file, {
		root: 'uploads'
	});
};

export default fileSender;
