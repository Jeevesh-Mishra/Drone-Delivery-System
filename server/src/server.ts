import app from './app';
import { connectDB } from './config/db';
import { User } from './models/User';
import { seedDatabase } from './database/seed';
import { startDeliveryScheduler } from './services/deliveryScheduler';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB (Atlas, Local, or fallback to in-memory)
    await connectDB();

    // 2. Programmatic Seeding fallback if database is empty
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('Database empty! Triggering programmatic data seeding...');
      await seedDatabase(false);
    } else {
      console.log('Database already populated. Skipping programmatic seeding.');
    }

    // 3. Start listening for requests
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  Drone Command Center Backend API online!`);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });

    // 4. Start the delivery auto-progression background scheduler
    startDeliveryScheduler();

  } catch (error) {
    console.error('CRITICAL: Server startup failed due to database or engine errors:', error);
    process.exit(1);
  }
};

startServer();
