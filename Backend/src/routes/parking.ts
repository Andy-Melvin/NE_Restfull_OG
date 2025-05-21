import express from 'express';
import {
  createParking,
  listParkings,
  getParking,
  updateParking,
  deleteParking,
  getParkingStats,
  getParkingUtilization
} from '../controllers/parking';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createParkingSchema } from '../schema/auth.schema';

const router = express.Router();

/* ========== PUBLIC ROUTES ========== */
// Anyone can view available parkings
router.get('/', listParkings);
router.get('/:id', getParking);

/* ========== AUTHENTICATED ROUTES ========== */
// All routes below this point require authentication
router.use(authenticate);

/* ========== ADMIN ONLY ROUTES ========== */
// Create new parking - Only admin can create
router.post(
  '/',
  authorize(['ADMIN']),
  validate(createParkingSchema),
  createParking
);

// Update parking - Only admin can update
router.put(
  '/:id',
  authorize(['ADMIN']),
  validate(createParkingSchema),
  updateParking
);

// Delete parking - Only admin can delete
router.delete(
  '/:id',
  authorize(['ADMIN']),
  deleteParking
);

// Get parking statistics - Only admin can view
router.get(
  '/stats/overview',
  authorize(['ADMIN']),
  getParkingStats
);

// Get parking utilization - Only admin can view
router.get(
  '/stats/utilization',
  authorize(['ADMIN']),
  getParkingUtilization
);

export default router; 