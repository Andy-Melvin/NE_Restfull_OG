import express from 'express';
import {
  getOutgoingCarsReport,
  getEnteredCarsReport,
  getParkingUtilizationReport
} from '../controllers/report';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { reportQuerySchema } from '../schema/report.schema';

const router = express.Router();

/* ========== ADMIN ONLY ROUTES ========== */
// All report routes require admin access
router.use(authenticate, authorize(['ADMIN']));

// Get outgoing cars report
router.get(
  '/outgoing',
  validate(reportQuerySchema),
  getOutgoingCarsReport
);

// Get entered cars report
router.get(
  '/entered',
  validate(reportQuerySchema),
  getEnteredCarsReport
);

// Get parking utilization report
router.get(
  '/utilization',
  validate(reportQuerySchema),
  getParkingUtilizationReport
);

export default router; 