import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/upload.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();
router.post('/', upload.single('file'), uploadFile);
export default router;
