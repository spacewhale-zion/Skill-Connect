import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // --- ADD THIS LINE TO DEBUG ---
    console.log(`Attempting to connect to MongoDB at: ${process.env.MONGO_URI}`);
    // -----------------------------

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host} 🚀`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;