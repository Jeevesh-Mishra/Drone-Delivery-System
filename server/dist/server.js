"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const User_1 = require("./models/User");
const seed_1 = require("./database/seed");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // 1. Connect to MongoDB (Atlas, Local, or fallback to in-memory)
        await (0, db_1.connectDB)();
        // 2. Programmatic Seeding fallback if database is empty
        const userCount = await User_1.User.countDocuments({});
        if (userCount === 0) {
            console.log('Database empty! Triggering programmatic data seeding...');
            await (0, seed_1.seedDatabase)(false);
        }
        else {
            console.log('Database already populated. Skipping programmatic seeding.');
        }
        // 3. Start listening for requests
        app_1.default.listen(PORT, () => {
            console.log(`=================================================`);
            console.log(`  Drone Command Center Backend API online!`);
            console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  Port: ${PORT}`);
            console.log(`  Health Check: http://localhost:${PORT}/api/health`);
            console.log(`=================================================`);
        });
    }
    catch (error) {
        console.error('CRITICAL: Server startup failed due to database or engine errors:', error);
        process.exit(1);
    }
};
startServer();
