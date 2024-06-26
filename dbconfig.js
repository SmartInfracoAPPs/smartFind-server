// dbconfig.js
import mongoose from "mongoose";
import express from "express";
import dotenv from 'dotenv'
import bodyParser from "body-parser";

dotenv.config();
const dbconfig = async () => {
  const app = express();
 
  app.use(bodyParser.json());

  // MongoDB connection
  try {
    // mongodb://localhost:27017/geoLTE
    await mongoose.connect(`mongodb://root:tFhh2hQwHwKiIB7pwFhNfbylsafgxcfWOF9Yd532vcq4juGZFez0sQ02pa7abSMb@197.253.124.146:5432/?directConnection=true`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Handle the error, maybe throw it or handle it according to your application's needs
    throw error;
  }

  return app;
};

export default dbconfig;
