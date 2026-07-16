"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoMemoryServer = null;
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        if (uri && uri !== 'memory') {
            await mongoose_1.default.connect(uri);
            console.log(`Connected to MongoDB Atlas/External instance successfully.`);
        }
        else {
            throw new Error("No MONGODB_URI provided or set to 'memory'.");
        }
    }
    catch (error) {
        console.warn(`MongoDB Connection Notice: ${error.message}`);
        console.log('Falling back: Spinning up an in-memory MongoDB server...');
        try {
            mongoMemoryServer = await mongodb_memory_server_1.MongoMemoryServer.create();
            const mongoUri = mongoMemoryServer.getUri();
            await mongoose_1.default.connect(mongoUri);
            console.log(`Connected to in-memory MongoDB server successfully at: ${mongoUri}`);
        }
        catch (memError) {
            console.error(`In-memory database initialization failed: ${memError.message}`);
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongoMemoryServer) {
            await mongoMemoryServer.stop();
        }
        console.log('Database disconnected successfully.');
    }
    catch (error) {
        console.error(`Database disconnection error: ${error.message}`);
    }
};
exports.disconnectDB = disconnectDB;
