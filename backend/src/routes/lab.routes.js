import { Router } from 'express';
import multer from 'multer';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listLabTests, createLabTest, uploadResult } from '../controllers/lab.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();
router.get('/', listLabTests);
router.post('/', [body('name').notEmpty(), body('patient').isMongoId()], validate, createLabTest);
router.post('/:id/result', [param('id').isMongoId()], validate, upload.single('file'), uploadResult);
export default router;
