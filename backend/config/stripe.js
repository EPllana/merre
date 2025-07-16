// /config/stripe.js ose në controller direkt
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // përdor .env
export default stripe;
