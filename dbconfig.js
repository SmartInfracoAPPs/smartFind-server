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
    await mongoose.connect(`mongodb://root:y2IW91lqKRaZwtCXA0wzV6ZxQcIqvR2hdCdzVdTOByfbhjgyQ0c3r8Grlo307zax@10.247.5.115:27017/goeLTE`, {
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
