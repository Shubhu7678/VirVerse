import { Router } from 'express';
import protect from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { stats, listStudents, getStudent, updateAccess, listLogs, updateStudent, resetStudentPassword, setStudentDisabled, deleteStudent, listEmails } from '../controllers/adminController.js';
import { studentEditRules, handleValidation } from '../middleware/validate.js';

const router = Router();
router.use(protect, requireAdmin);

router.get('/stats', stats);
router.get('/logs', listLogs);
router.get('/emails', listEmails);
router.get('/students', listStudents);
router.get('/students/:id', getStudent);
router.put('/students/:id/access', updateAccess);
router.patch('/students/:id', studentEditRules, handleValidation, updateStudent);
router.post('/students/:id/reset-password', resetStudentPassword);
router.post('/students/:id/disable', setStudentDisabled);
router.post('/students/:id/enable', setStudentDisabled);
router.delete('/students/:id', deleteStudent);

export default router;
