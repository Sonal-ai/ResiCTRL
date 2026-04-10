import app from '../src/app.js';
import { configureCloudinary } from '../src/configs/cloudinary.js';

// Configure external services for Serverless Cold Start
configureCloudinary();

export default app;
