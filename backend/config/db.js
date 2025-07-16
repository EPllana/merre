import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Lidhja e MongoDB u kry me sukses");
  } catch (error) {
    console.error("❌ Lidhja deshtoi:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;
