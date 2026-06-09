import { Router } from 'express';
import {
  getAttendance,
  upsertAttendance,
  bulkAttendance,
} from '../controllers/attendanceController.js';

const router = Router();

router.get('/', getAttendance);
router.post('/', upsertAttendance);
router.post('/bulk', bulkAttendance);

export default router;
