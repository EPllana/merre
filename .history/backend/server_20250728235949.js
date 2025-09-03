import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDatabase from "./config/db.js"; // ndrysho path sipas vendndodhjes
import apiRoutes from "./routes/routes.js";
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";






const app = express();

app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cors("*"));

app.get("/prsh", (req, res) => {
  res.json({ message: "prsh nga backend" });
});

app.use("/api", apiRoutes)//users
app.use('/api', bookingRoutes);// bookings 
app.use("/api", paymentRoutes);//payments





const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is working on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error);
  }
};

startServer();
