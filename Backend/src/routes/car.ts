import express from 'express';
import {
  registerCarEntry,
  registerCarExit,
  getActiveParkingRecords
} from '../controllers/car';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { carEntrySchema, carExitSchema } from '../schema/car.schema';

const router = express.Router();

/* ========== PUBLIC ROUTES ========== */
// Get active parking records
router.get('/active', getActiveParkingRecords);

/* ========== AUTHENTICATED ROUTES ========== */
// All routes below this point require authentication
router.use(authenticate);

/* ========== STAFF ROUTES (Admin and Parking Attendant) ========== */
// Register car entry - Both admin and parking attendant can register entries
router.post(
  '/entry',
  authorize(['ADMIN', 'PARKING_ATTENDANT']),
  validate(carEntrySchema),
  registerCarEntry
);

// Register car exit - Both admin and parking attendant can register exits
router.post(
  '/exit',
  authorize(['ADMIN', 'PARKING_ATTENDANT']),
  validate(carExitSchema),
  registerCarExit
);

export default router; 