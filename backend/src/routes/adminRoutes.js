import { Router } from 'express';
import protect from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { stats, listStudents, getStudent, updateAccess, listLogs } from '../controllers/adminController.js';

const router = Router();
router.use(protect, requireAdmin);

router.get('/stats', stats);
router.get('/logs', listLogs);
router.get('/students', listStudents);
router.get('/students/:id', getStudent);
router.put('/students/:id/access', updateAccess);

export default router;
