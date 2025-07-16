import express from "express";
import { createPayment, getUserPayments, getAllPayments, handleStripeWebhook,getPaymentStatus } from "../controller/paymentController.js";
import verifyToken from "../middlewares/verifyToken.js";


const router = express.Router();

router.post("/payment", verifyToken, createPayment);
router.get("/payments", verifyToken, getUserPayments);
router.get("/all-payments", verifyToken, getAllPayments);


router.post("/stripe-webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

router.get("/payment-status/:paymentIntentId", verifyToken, getPaymentStatus);





export default router;
