import Payment from "../models/Payment.js";
import dotenv from "dotenv"
dotenv.config();
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 




export const createPayment = async (req, res) => {
    try {
        const userId = req.user.userId;

      const { amount, currency = "eur" } = req.body;
  
      if (!userId) {
        return res.status(400).json({ message: "userId mungon!" });
      }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ["card"]
      });
  
      const payment = new Payment({
        userId,
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status,
      });
  
      await payment.save();
  
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Gabim nga stripe ose mongo:", error);
      res.status(500).json({ message: "Failed to create payment intent", error });
    }
  };

  export const getUserPayments = async (req, res) => {
    const userId = req.user.userId; // ose req.user.id, në varësi si ke verifyToken
  
    try {
      const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        .populate("userId", "name surname email"); // <-- popullo userin, merr vetëm username dhe email
  
      res.status(200).json({
        message: "Pagesat u kthyen me sukses",
        payments,
      });
    } catch (error) {
      console.error("Failed to get payments", error);
      res.status(500).json({ message: "Failed to get payments" });
    }
  };
  
  export const getAllPayments = async (req, res) => {
    // Kontrollo nëse përdoruesi është admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can view all payments." });
    }
  
    try {
      const payments = await Payment.find()
        .sort({ createdAt: -1 })
        .populate("userId", "name surname email");
  
      res.status(200).json({
        message: "Krejt pagesat u kthyen me sukses",
        payments,
      });
    } catch (error) {
      console.error("Failed to get all payments", error);
      res.status(500).json({ message: "Failed to get all payments" });
    }
  };
  

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const paymentIntent = event.data.object;

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("💰 PaymentIntent succeeded:", paymentIntent.id);
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: "succeeded" }
        );
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Payment failed:", paymentIntent.id);
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: "failed" }
        );
        break;

      case "payment_intent.requires_payment_method":
        console.log("⚠️ Payment requires new payment method:", paymentIntent.id);
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: "requires_payment_method" }
        );
        break;

      case "payment_intent.processing":
        console.log("⏳ Payment is processing:", paymentIntent.id);
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: "processing" }
        );
        break;

      case "payment_intent.canceled":
        console.log("🚫 Payment was canceled:", paymentIntent.id);
        await Payment.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { status: "canceled" }
        );
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("⚠️ Error processing webhook event:", error);
    res.status(500).send("Server error");
  }
};


export const getPaymentStatus = async (req, res) => {
    const { paymentIntentId } = req.params;
  
    try {
      const payment = await Payment.findOne({ paymentIntentId });
  
      if (!payment) {
        return res.status(404).json({ message: "Pagesa nuk u gjet" });
      }
  
      res.status(200).json({
        paymentIntentId: payment.paymentIntentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
    } catch (error) {
      console.error("Gabim gjatë marrjes së statusit të pagesës:", error);
      res.status(500).json({ message: "Gabim në server" });
    }
  };