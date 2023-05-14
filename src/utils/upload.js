import multer from 'multer';
import { formatFilename } from './promisified.js';

const storage = multer.diskStorage({
	destination: 'uploads/',
	filename: formatFilename
});

const upload = multer({ storage });

export default upload;
