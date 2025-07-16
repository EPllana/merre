import express from 'express';
import { createBooking,getBookings, updateBookings,confirmedBooking,cancelBooking ,deleteBooking} from '../controller/booking.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/bookings', verifyToken, createBooking);
router.get('/bookings', verifyToken, getBookings);
router.put('/bookings/:id',verifyToken,updateBookings)
router.put('/bookings/:id/confirmed', verifyToken, confirmedBooking);
router.put('/bookings/:id/cancel', verifyToken, cancelBooking);
router.delete('/bookings/:id',verifyToken,deleteBooking)


export default router;
