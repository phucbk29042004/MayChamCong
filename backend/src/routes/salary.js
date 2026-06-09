import { Router } from 'express';
import {
  getSalaryList,
  exportSalaryExcel,
} from '../controllers/salaryController.js';

const router = Router();

router.get('/', getSalaryList);
router.get('/export', exportSalaryExcel);

export default router;
