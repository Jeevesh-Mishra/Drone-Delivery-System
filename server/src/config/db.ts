import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri !== 'memory') {
      await mongoose.connect(uri);
      console.log(`Connected to MongoDB Atlas/External instance successfully.`);
    } else {
      throw new Error("No MONGODB_URI provided or set to 'memory'.");
    }
  } catch (error: any) {
    console.warn(`MongoDB Connection Notice: ${error.message}`);
    console.log('Falling back: Spinning up an in-memory MongoDB server...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`Connected to in-memory MongoDB server successfully at: ${mongoUri}`);
    } catch (memError: any) {
      console.error(`In-memory database initialization failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('Database disconnected successfully.');
  } catch (error: any) {
    console.error(`Database disconnection error: ${error.message}`);
  }
};
