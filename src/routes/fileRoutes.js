import { Router } from 'express';
import fileController from '../controllers/fileController.js';
import upload from '../utils/upload.js';

const router = Router();

router.post('/upload', upload.array('files'), fileController.upload);

router.get('/:fileName', fileController.send);

export default router;
