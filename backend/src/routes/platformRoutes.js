import { Router } from 'express';
import protect from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/tenancy.js';
import * as c from '../controllers/platformController.js';

const router = Router();
router.use(protect, requireSuperAdmin);

router.get('/stats', c.stats);
router.get('/plans', c.listPlans);
router.get('/audit-logs', c.listAuditLogs);
router.get('/organizations', c.listOrganizations);
router.post('/organizations', c.createOrganization);
router.patch('/organizations/:id', c.updateOrganization);
router.post('/organizations/:id/status', c.setStatus);
router.put('/organizations/:id/subscription', c.updateSubscription);
router.post('/organizations/:id/invitations', c.inviteAdmin);

export default router;
