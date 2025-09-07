import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message to the console if the connection is successful
    console.log(`MongoDB Connected: ${conn.connection.host} 🚀`);
  } catch (error) {
    // Log the error message to the console if connection fails
    console.error(`Error: ${error.message}`);
    
    // Exit the process with a failure code (1)
    process.exit(1);
  }
};

export default connectDB;